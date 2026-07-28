# Inventory refill analysis

Handover notes from a task analyzing what to restock each site with after a campaign, so the
transferable knowledge doesn't have to be re-derived next time. This describes an analysis
methodology, not code in this repository: the analysis code lives in the sibling
[`reims2/data-analysis`](https://github.com/reims2/data-analysis) repo (`analysis.py`/`.ipynb` in its
root), and its results are written up in [Inventory analysis](/inventory-analysis). See
[Optometry basics](/optometry-basics) for the domain background this leans on.

## The setting

- Each site (`sa`/`sm`) holds a fixed ~5,000-pair stock and dispenses roughly 1,000 pairs a year at
  its annual campaign (~Jan/Feb). A refill decision follows each campaign and tops the site back up
  to 5,000.
- Refill stock is hand-picked by staff from a US warehouse of tens of thousands of already-measured
  donated glasses. Only the picked, entered glasses become visible in REIMS2, not the whole
  warehouse. Warehouse availability can be assumed sufficient, so the question is what to pick, not
  whether enough exists.
- Culling of dead stock only happens on-site in San Salvador, every few years, usually by age.
- Search runs client-side and offline (see the root `CLAUDE.md`), so the backend only learns of a
  search when it fails. A successful dispense record stores the dispensed item's own
  sphere/cylinder/axis/add, never the prescription that was searched for. That asymmetry drives most
  of the statistical pitfalls below.
- The database snapshots to S3 roughly every 3 hours, so historical inventory state is partly
  reconstructable (see [Validate any reimplementation](#validate-any-reimplementation-of-the-matching-rule)).
- At the time of writing, three campaigns of data existed, one per year.

## It's not a clustering problem

The instinct is to cluster prescriptions into groups and compare group frequencies between demand
and stock. This fails structurally, not for lack of tuning. Clustering partitions; substitutability
overlaps. A single well-chosen pair can be eligible for a wide, oddly shaped region of prescription
space, and those regions overlap heavily with each other. A partition can't represent overlap, so
coarse clusters produce generic advice and fine clusters produce advice nobody can act on.

The correct framing is **stocking under substitution**: choose what to add to a pool of
substitutable items so the number of served requests is maximised.

### The matching rule supplies the resolution

The product already has a matching rule (see [Matching Algorithm](/philscore)), so it already
defines "close enough to substitute." There's no need to choose a bin size or kernel bandwidth. Two
things follow:

1. The neighborhood is **anisotropic and position-dependent**: axis tolerance is unlimited at zero
   cylinder and very tight at high cylinder (see [Optometry basics](/optometry-basics)). No fixed
   grid or metric represents that, which is why standardizing features and running k-means or Ward
   gives geometry unrelated to whether two items actually substitute for each other.
2. Reimplementing the rule faithfully, not just approximately, is the highest-value first step.
   Everything else builds on it.

### Separate the hard filter from the ranking score

Matching systems like this usually have a filter that decides eligibility and a score that ranks the
eligible set. For "how many people go home with something," only the filter matters: the score
affects fit quality, not whether anyone is served. This is an exact simplification that removes most
of the complexity.

### It's a bipartite matching, not a coverage count

Each physical item serves one request and is then gone, so coverage without multiplicity overstates
performance whenever many requests compete for the same few items. Model it as a bipartite graph:
requests and items, with an edge wherever the filter says eligible. Maximum matching size is the
number served, and unmatched requests are the true shortfall.

For choosing what to add, a two-phase greedy is simple and effective:

1. **Fill gaps**: repeatedly add the candidate eligible for the most currently unmatched requests.
2. **Restock depth**: spend the remaining budget replacing what phase 1 consumed, prioritizing
   requests with the fewest eligible items in stock.

Phase 1 is greedy max coverage, which has good known guarantees for this class of objective.

### Check the turnover arithmetic first

If the stock cap is fixed and annual throughput is small relative to stock size, the refill budget
is a small fraction of the pool and composition changes slowly. Under those conditions, **culling
dead stock is a bigger lever than optimizing the refill**, since culling is what creates refill
headroom in the first place. Check this arithmetic before investing in a refill optimizer.

## Statistical pitfalls in this kind of data

### Censored demand

Only demand that supply could satisfy gets observed. Where stock was thin, requests failed and may
or may not have been logged. In regions where supply was adequate, nothing is learned about unmet
demand, by construction. If failures are logged only under a precise, known condition (e.g. "the
eligible set was empty"), the censoring mechanism is exactly known and reproducible. Read the actual
source condition rather than trusting anyone's recollection of it.

### Proxy bias: the dispensed item is not the request

Since dispense records store the item handed over rather than the request searched for (see
[The setting](#the-setting)), the demand estimate is generated by REIMS2's own inventory: an empty
region produces no dispensing, so it looks like zero demand. Reasoning from that is circular and
will recommend refilling exactly what's already stocked. Ranked fixes:

1. **Best**: log the request on every search, not just failed ones. Cheap and removes the problem
   entirely, though as a frontend change it was estimated at a few months of work.
2. **Interim**: treat a dispensed item as an interval-censored observation. The request lay inside
   that item's tolerance region, and since it was the top-ranked available option, that narrows it
   down further. EM or sampling over the latent request is legitimate here.
3. **Crude**: use the item values directly as a demand proxy, being explicit that this understates
   demand wherever stock was thin.

### Deduplicate retries

Staff often run several similar searches per patient. Treating each as a separate patient inflates
demand unevenly toward the hard cases, exactly the ones being measured. Deduplicate identical
requests within a time window before using search logs as demand.

### Dead stock detection

Items eligible for zero observed demand over a long window are candidates for removal, combined with
an age filter. "Old and useless" is safer than either condition alone: the demand proxy understates
real demand, so "useless" alone over-removes, and age alone removes plenty of perfectly good stock.

### Validate any reimplementation of the matching rule

If failures are logged when the eligible set is empty, that's a free, rigorous test: reconstruct the
inventory at the time of each logged failure (items in stock added before T, plus items dispensed
after T that were added before T, reconstructable thanks to the roughly 3-hourly S3 snapshots) and
replay it. A faithful filter must return zero eligible items for every one of those. A high pass rate
confirms the port; a cluster of failures in one time window usually points at a known bug or data
issue in that period rather than in the new code.

## Making the output usable

Two concerns that are easy to conflate:

- **Optimization granularity**: continuous, driven by the matching rule, no binning.
- **Reporting granularity**: whatever the humans executing the plan can actually follow.

Optimize first, then compress the chosen set into a small number of interpretable rules, and
**measure the loss from compression**. That turns "how coarse should the groups be" from a judgment
call into a curve: five rules recover this much of the achievable gain, fifteen rules recover this
much.

The right output format follows from how the refill is physically executed. Someone walking a
warehouse reading labels needs a short list of value ranges with target counts; axis is usually left
unspecified, since it's uninformative for the low-cylinder stock that dominates demand. If items are
entered into software one at a time, a per-item value score shown at entry time beats any periodic
report and stays current automatically.

## Evaluation

The only honest test is a backtest: fit on earlier campaigns, produce a plan under the same budget
that was actually available, and evaluate it against a later campaign's actual outcome.

Be careful which outcome is evaluated on. The part of demand data contaminated by proxy bias is
biased in favor of whatever was actually stocked. Evaluate on the uncontaminated part instead
(usually the logged failures, since those carry real request values), and check that the new plan
doesn't lose any request that previously succeeded.
