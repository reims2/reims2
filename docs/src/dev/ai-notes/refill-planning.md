# Refill planning

How **What to refill** (`frontend/src/lib/refill.ts`, `views/RefillReport.vue`) builds its list, and
the backtest that chose this method. The user view is in [Reports](/guide/reports#what-to-refill).

## Inputs

All of it runs in the browser, like matching. The page loads two lists once per visit:

- every pair that left the site (`getDispensedGlasses`, no date filter), and
- every logged search without results (`GET /api/glasses/unsuccessful/{location}`, decoded back to a
  `GlassesSearch` in `stores/glasses.ts`).

`toPatients` turns them into past patients with a campaign year. A pair dispensed with reason
`DISPENSED` stands in for the prescription it was found for, since dispenses store the pair, not the
search. Deleted pairs are not patients. History, which stands in for what the US inventory offers, is
today's stock plus every pair that left. The plan is recomputed whenever `allGlasses` changes while
the page is shown (`keep-alive`, the store polls every two minutes).

## Algorithm

`planRefill(stock, history, patients, freeSkus)`:

1. **Unserved.** A patient is unserved when `fitsSearch` (the PhilScore filter without the score)
   accepts no stock pair. For each history pair, the unserved patients it fits are kept. Stock pairs
   fit none by definition and are skipped.
2. **Cells.** Each history pair goes into a cell: glasses type, average sphere of both eyes rounded
   to 0.50, and cylinder band of the larger absolute cylinder (up to 0.50, 1.50, 2.50, above). Add is
   left out, pairs picked within a range bring the usual adds. A pair's weight is the number of
   campaigns in which it fits an unserved patient. Retries and similar patients in one campaign
   count once, and a need that comes back every year counts more. Weighting each pair only by
   whether it fits anyone reached about 3 fewer patients in the backtest.
3. **Candidates.** Every range per type: sphere at most 2.00 D wide and any cylinder band span,
   about 2,000 per type. Each sums its pairs directly. A range needs at least 3 pairs and some
   weight. Its gain is `min(freeSkus / 5, size) × weight / size`: what a fair share of the
   SKUs would reach there.
4. **Pick.** Candidates are scored once and stable-sorted by gain, single vision before multifocal on
   ties. The first five that don't overlap win. Gain doesn't depend on earlier picks, so this equals
   greedy re-scoring per round.
5. **Pairs.** Rules are ordered by total weight, so the range whose pairs helped most often comes
   first. Each gets its size, capped by what is left. Leftover SKUs go to "any other glasses".

On today's data a plan takes 100 to 550 ms, most of it in `fitsSearch` (unserved patients × pairs
that left). Summing per range costs about 100 ms more than a precomputed grid would, for much less
code. The page waits one tick before computing so the loading state paints.

## Backtest

CSV exports of both sites, November 2026. For the 2024 to 2026 campaigns the stock before each
campaign was rebuilt without its refill, and each method got as many pairs as the real refill. Pairs
were drawn at random within a method's ranges from the pairs the site had before. A patient of the
next campaign counts as reached when the current PhilScore filter accepts a pair left for them.
Patients served by the real refill's pairs were left out, so no method gets credit for them. Extra is
the patients reached beyond no refill at all, over six campaigns with 2,710 patients.

| Method                                   | Extra  | Score < 1 | Pros                      | Cons                                   |
| ---------------------------------------- | ------ | --------- | ------------------------- | -------------------------------------- |
| Refills that were done                   | 32     | 18        | Nothing to build          | Misses the gaps                        |
| Five ranges that mirror demand           | 32     | 21        | Easy to remember          | Broad, no better than today            |
| One row per 0.50 D range, demand − stock | 47     | 30        | Simple, explainable       | About 170 rows nobody follows          |
| The analysis method, one row per range   | 54     | 35        | Best list                 | Matching replay, still a long list     |
| **Five ranges for unserved patients**    | **56** | **38**    | Five lines, the best fits | Reacts only after patients were missed |

- Picking ranges without looking at today's stock reached only 5. A full replay that hands each
  patient one pair gained nothing over the plain "nothing in stock fits" check.
- Those patients are 80 to 90% searches without results. Dispensed pairs alone (60) or failed
  searches alone (55) point at the same ranges. Half of the logged failures succeed with today's
  PhilScore, so they are noisy.
- No gain from skip rules, 1.00 D ranges, OD sphere only, or sharing pairs out by demand. Over two
  campaigns without a refill the lead held (97 against 68), and a running-low warning was right once
  in 12 times.
- Ordering rules by patients reached instead of by share of pairs that fit changed nothing (55.0
  against 54.6), and neither did leaving add out of the ranges (56 against 55).
- Within a range, fewer than 4 in 100 past pairs fit someone who found nothing. The gain is real but
  small: about four patients per campaign and site over today's refills.

## Limits and next steps

- It only reacts to patients who were already missed, and a range with no misses never shows up.
- History stands in for US supply, so a range the site never had can't be asked for.
- Blurscore barely changes the plan. Find shows its picks graded good when PhilScore finds
  nothing, but they fit only 2 of 143 (Santa Ana) and 4 of 150 (San Miguel) of today's unserved
  patients. In the backtest blurscore served 24 patients on its own, so every refill gains about a
  quarter less (this page 40 instead of 56, the refills that were done 23 instead of 32), in the same order. A
  planner that also counts blurscore's picks reached 39.6, so planning stays on PhilScore.
- Searches are logged with PhilScore's result count, so one where only blurscore found something
  still counts as without results. A pair blurscore picked is a looser stand-in for the prescription.
- The backtest scripts were one-off and are not in the repo. The setup above is enough to rebuild
  them. From 2027 every search is logged: re-run with searches as patients, the search behind a
  dispensed pair instead of the pair, and check whether the failure noise was hiding other ranges.
