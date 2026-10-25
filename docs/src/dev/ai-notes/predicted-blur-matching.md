# Predicted-blur matching

A second matching algorithm, implemented in `frontend/src/lib/blurscore.ts`. The Find page runs it
next to PhilScore on every search and offers some of its picks as experimental suggestions, to find
out whether volunteers take them, see [Comparison with PhilScore](#comparison-with-philscore). It works out proposal 7 of
[PhilScore improvement ideas](/dev/ai-notes/philscore-improvements), which also has the literature.

## Summary

- One number per pair: the blur the patient is predicted to see, in diopters (D). Lower is better.
  Volunteers only see a small flask icon on the cards it suggests.
- Same inputs as PhilScore, no new fields, runs in the browser.
- Power vectors replace the axis table, the spherical equivalent (SE) candidates, the three bonus
  rules and the add window.
- Against PhilScore with the October 2026 zero-cylinder fix, it finds a match as often, but picks a
  different first pair in about half of single vision and two thirds of multifocal searches. Most
  clear differences are reading power for multifocals and balance between the eyes.

## Goals

- Rank by what the patient will see, with rules an optometrist can check one by one.
- Same inputs and offline behaviour as PhilScore, so both can run on every search.
- Grades volunteers can read without knowing a scale.

Replacing PhilScore now is not a goal, nor are pupil distance, prism and frame fit, which have no
data. It must not return more pairs at the cost of worse first picks, or present differences below a
quarter diopter as meaningful.

## Alternatives considered

| Approach                        | Why not                                                                                                                                                                                                                                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Improve PhilScore step by step  | Ranks almost like PhilScore, so volunteers would have nothing to compare.                                                                                                                                                                                                                             |
| Predicted acuity (20/xx)        | Needs best-corrected acuity, which isn't recorded. Acuity relative to the best is shown with the [grades](#_7-grades-and-order).                                                                                                                                                                      |
| Arnold 2021 A/B/C grades        | Needs age and pupil distance, fitted on 8 to 10 subjects, and its two versions disagree, e.g. 0.5 or 1 D of over-plus per grade. In the [replay](#arnold-2021-as-a-matcher) it hands out extra plus far more often. Its relief for high cylinder and its age shape for over-minus are borrowed below. |
| Percent match, like ReSpectacle | ReSpectacle's formula is unpublished. A percent relative to the Rx would rate a -6.00 that's 0.75 off as good and a -0.75 that's 0.25 off as poor, though the first is worse.                                                                                                                         |

## Algorithm

Inputs are sanitized as for PhilScore (`sanitizeEyeValues`), and only glasses of the searched type
are considered. The letters are listed in [Parameters](#parameters).

### 1. Errors per eye

Convert Rx and lens to power vectors (see
[Optometry basics](/optometry-basics#power-vectors-measuring-how-far-apart-two-axes-are)):

```text
M   = S + C/2
J0  = -(C/2) * cos(2 * axis)
J45 = -(C/2) * sin(2 * axis)

dM  = M_lens - M_rx                      focus error, > 0 is too much plus
dJ  = |(J0, J45)_lens - (J0, J45)_rx|    leftover cylinder is 2 * dJ
```

Axis wraparound and zero cylinder need no special case, since a zero cylinder has J = 0 whatever its
stored axis. Trading cylinder for sphere is covered too, so no SE candidates are needed.

### 2. Distance blur

```text
astig  = w * dJ / (1 + |C_rx| / k)
focus  = |dM|, times m if dM < 0 on a single vision search with M_rx > 0
b_dist = sqrt(focus^2 + astig^2)
```

- `w`: how much leftover astigmatism counts against focus error. Optics, blur limits and pooled
  acuity data put it at 1 per unit of blur strength (Atchison 2009, Guo 2010, Blendowske 2015).
  Acuity at small blur puts it at 2 (Atchison 2011, Mathur 2015, 8 and 22 subjects). So does Arnold
  2021's one-line limit for a low Rx cylinder, read on Blendowske's acuity scale. The default is
  the upper end, see [open questions](#open-questions-for-optometrists). With `w = 2`, `astig` is the
  leftover cylinder for a low-cylinder Rx.
- `k`: patients with high cylinder see less sharply even when fully corrected and often get reduced
  cylinder. Arnold 2021a's fit for donated glasses grows the tolerated error at about this rate,
  its revised fit (2021b) more slowly. REIMS1's axis table is flat up to 1.50 D and then grows too.
- `m`: a plus single vision Rx is mostly a hyperope or a presbyope's reader. Neither can focus
  through extra minus without strain or blur. Myopes stay symmetric.

### 3. Reading blur, multifocal only

```text
dNear  = dM + (add_lens - add_rx)
near   = -dNear if dNear < 0, else n * dNear
b_near = sqrt(near^2 + astig^2)
b_eye  = max(b_dist, b_near)
```

A presbyope reads through sphere plus add, so `+1.25 add +2.25` reads like `+1.00 add +2.50`. Too
little reading power can't be made up for, too much can by holding the page closer. For single
vision, `b_eye = b_dist`.

### 4. Pair score

```text
score   = e * max(b_od, b_os) + (1 - e) * min(b_od, b_os) + balance
balance = 0.5 * max(0, |dM_od - dM_os| - 0.25)
```

Drop the pair if `|dM_od - dM_os| > 1.0`. Both eyes focus by the same amount, so opposite focus
errors can't both be cleared, and ready-made glasses trials cut at 1 D. The worse eye counts more
because a pair is judged by its weak point.

### 5. Exclusions

Drop a pair if:

- an eye ends up more than 0.25 D blurrier than with no glasses (`b_eye` of a plano lens, add 0),
- the score isn't lower than the same formula for plano lenses, without the balance term, or
- the score exceeds the limit: 0.75, or 1.25 with high tolerance.

The first two matter for low prescriptions, e.g. `-1.00` for a `-0.50` myope.

### 6. BAL

The form allows at most one BAL eye. That eye isn't scored, and its lens SE must be within 1.0 D of
the other lens's SE, so the pair looks and weighs alike. The score is the other eye's `b_eye`, and
the exclusions apply to that eye.

### 7. Grades and order

| Score  | Grade     | Meaning, after Atchison 2005 | Best acuity kept, Blendowske 2015 |
| ------ | --------- | ---------------------------- | --------------------------------- |
| ≤ 0.25 | excellent | below noticeable blur        | 94 % or more                      |
| ≤ 0.50 | good      | below troublesome blur       | 80 %, about 1 line lost           |
| ≤ 0.75 | fair      | around objectionable blur    | 64 %, about 2 lines lost          |
| ≤ 1.25 | poor      | high tolerance only          | 39 %, about 4 lines lost          |

Sort by score. A refraction repeats to about ±0.25 D, so pairs within one grade are close to
equivalent. The acuity column is `1 / (1 + score^2)`, so the UI can show it for any score. Blendowske's
model counts astigmatism once, so with `w = 2` it errs on the pessimistic side.

## Parameters

| Name                             | Default          | Basis                                                                                                                                                            |
| -------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `w`, astigmatism weight          | 2                | Acuity at small blur (Atchison 2011, Mathur 2015). Optics, blur limits and pooled acuity give 1. Open.                                                           |
| `k`, high-cylinder relief        | 2                | Arnold 2021a (1.8). Arnold 2021b and REIMS1's axis table above 2.50 D give 3.6 to 5. Without relief, 10 % of single vision searches find nothing instead of 3 %. |
| `m`, extra minus on plus Rx      | 1.5              | Arnold 2021's age formulas at 55 to 60 give 1.25 to 1.96.                                                                                                        |
| `n`, too much reading power      | 0.75             | Clinical judgement.                                                                                                                                              |
| `e`, worse-eye share             | 0.75             | Judgement. WinGlasses optimizes one value for both eyes and offered pairs that worsened the weaker eye (Huang 2021).                                             |
| Balance free, slope, drop        | 0.25, 0.5, 1.0 D | Ready-made trials, Skov 2026.                                                                                                                                    |
| No-harm margin per eye           | 0.25 D           | One quarter step.                                                                                                                                                |
| BAL lens SE difference           | 1.0 D            | PhilScore's BAL tolerance.                                                                                                                                       |
| Limit, normal and high tolerance | 0.75 D, 1.25 D   | Objectionable blur. Gives match counts close to PhilScore's in the [replay](#replay).                                                                            |

## Worked examples

PhilScore sums both eyes, so compare the order, not the values. Same lens on both eyes unless noted.
They're unit tests in `frontend/src/test/blurscore.test.ts`.

| Rx                  | Lens                                  | PhilScore | Blur                          |
| ------------------- | ------------------------------------- | --------- | ----------------------------- |
| `-1.50 -1.50 x 90`  | axis 10 degrees off                   | 0.01      | 0.30 good                     |
|                     | sphere 0.25 off                       | 0.50      | 0.25 excellent                |
|                     | `-1.75 -1.00`, exact SE               | 0.50      | 0.29 good                     |
|                     | `-2.00 -0.50`, exact SE               | 2.00      | 0.57 fair                     |
| `-1.00 -3.00 x 180` | axis 8 degrees off                    | 0.00      | 0.33 good                     |
| `+2.00 -1.00 x 90`  | `+1.75 -0.50`, exact SE               | 0.90      | 0.33 good                     |
|                     | `+2.25 -1.00`, 0.25 too much plus     | 0.50      | 0.25 excellent                |
|                     | `+1.75 -1.00`, 0.25 too much minus    | 1.00      | 0.38 good                     |
| `+1.00 add +2.50`   | `+1.00 add +2.00`                     | 0.10      | 0.50 good                     |
|                     | `+1.25 add +2.25`, same reading power | 0.55      | 0.25 excellent                |
| `-2.00` both eyes   | `-2.25` and `-2.25`                   | 0.50      | 0.25 excellent                |
|                     | `-2.25` and `-1.75`                   | 0.50      | 0.38 good                     |
| `-0.50` both eyes   | `-1.00`, high tolerance               | 1.00      | dropped, not better than none |

## Replay

Data from dev.reims2.app in October 2026, with the stock rebuilt for each moment from creation and
dispense dates. Each of the 3,365 pairs dispensed in 2023 to 2026 served as a stand-in Rx, with the
pair itself removed from stock. PhilScore includes the zero-cylinder fix, blur uses the default
parameters. The prototype and scripts were throwaway.

| Measure                                                        | Single vision  | Multifocal     |
| -------------------------------------------------------------- | -------------- | -------------- |
| Searches with a match, blur and PhilScore                      | 97 %, 98 %     | 99 %, 99 %     |
| Median matches, blur and PhilScore                             | 27, 32         | 63, 46         |
| Same first pick                                                | 48 %           | 35 %           |
| PhilScore's first pick in blur's top 3                         | 74 %           | 57 %           |
| PhilScore's first pick graded excellent or good                | 80 %           | 69 %           |
| Different first picks within 0.25 D on every measure           | 57 %           | 26 %           |
| Different first picks: reading power error, PhilScore and blur | -              | 0.43 D, 0.22 D |
| Different first picks: eye imbalance, PhilScore and blur       | 0.22 D, 0.13 D | 0.20 D, 0.14 D |

Both find a pair for about half of the 754 unique unsuccessful searches from 2024 to 2026 (blur 53 %,
PhilScore 54 %). Multifocals get more matches because there's no fixed add window, and most of the
extra ones grade fair. The stand-in Rx are lenses, not prescriptions, so this shows how the two
differ, not which is better.

### Sensitivity to `w` and `k`

Rebuilt and rerun on the same data a day later, reproducing the table above within a few points.
Values are single vision, then multifocal, for the first pick of each replayed dispense.

| `w`, `k`       | Same first pick as default | An eye left with 0.50 D cylinder or more | Median matches | Unsuccessful searches matched |
| -------------- | -------------------------- | ---------------------------------------- | -------------- | ----------------------------- |
| 2, 2 (default) | 100 %, 100 %               | 34 %, 32 %                               | 27, 63         | 53 %                          |
| 2, 3.6         | 95 %, 91 %                 | 32 %, 28 %                               | 22, 46         | 50 %                          |
| 1.5, 3.6       | 87 %, 83 %                 | 38 %, 37 %                               | 38, 92         | 57 %                          |
| 1.5, 2         | 83 %, 76 %                 | 40 %, 41 %                               | 47, 118        | 66 %                          |
| 1, 3.6         | 72 %, 58 %                 | 45 %, 49 %                               | 67, 184        | 72 %                          |
| 1, 2           | 68 %, 54 %                 | 47 %, 52 %                               | 76, 209        | 78 %                          |

- `k` barely matters, `w` does. A lower `w` trades focus error for leftover cylinder.
- With the limit fixed at 0.75, a lower `w` also lets far more pairs in, so the limit would have to
  move with it.
- No setting wins on every measure. Counting astigmatism once, all settings pick about equally well
  (worse eye 0.24 to 0.26 D of blur strength for single vision, against 0.27 for PhilScore). Counting
  it twice, the `w = 2` rows do best. The replay can't settle `w`, only optometrists or outcome data can.

### Arnold 2021 as a matcher

Arnold 2021b's grade, run on the same searches: the worst of both eyes and the anisometropia grade, B
or better, age 60 for multifocal, and PhilScore's add window, since Arnold has no add. It agrees with
PhilScore's first pick in 29 to 37 % of searches. Its first picks leave less cylinder (0.26 D on
average, blur 0.35), but give an eye 0.50 D or more of extra plus in 19 % of single vision and 25 %
of multifocal searches (blur 2 %, PhilScore 6 %), because it counts 1 D of extra plus as one lost
line. With the first paper's 0.5 D per line that falls to 6 %, but reading power stays 0.42 D off on
average (blur 0.22), because nothing checks it.

## Open questions for optometrists

- `w` and `k`, decided together. Leftover astigmatism counts `w / (1 + |C_rx| / k)` times as much as
  focus error: 1.6 at 0.50 D Rx cylinder, 1.14 at 1.50, 1.0 at 2.00 and 0.8 at 3.00 with the
  defaults. Below 1, dropping cylinder costs less than an equal sphere error, against REIMS1's "keep
  as much cylinder as possible" and Reddy 2017. That's the case for `w = 1` with any relief: an exact
  SE swap dropping 0.50 D from a -1.50 D cylinder would grade 0.14, excellent, against 0.29, good,
  now. A lower `w` needs a higher `k`, e.g. `w = 1.5` with `k = 3.6` (0.26), and a lower limit. See
  [sensitivity](#sensitivity-to-w-and-k) for how many first picks each choice changes.
- The other [parameters](#parameters), especially `m`.
- Age. Simulated on the replay, knowing it would change the first pick in 17 to 35 % of searches for
  clearly young or old patients, mostly between 0.25 too much plus and 0.25 too much minus. It never
  changes whether a match exists, so it's left out. An "under 40" checkbox on single vision searches
  would capture most of it.
- Should a lens with more cylinder than the Rx cost extra? It distorts more for first-time wearers,
  but we don't know who they are.
- Is the worse of distance and reading right for a multifocal, or should distance count more?

## Comparison with PhilScore

- The Find page keeps PhilScore's list, but the last card of each page of 3 goes to blur's best
  unlisted pair graded good or better, if blur predicts strictly less blur for it than for
  PhilScore's pick (`frontend/src/lib/interleave.ts`). Such pairs also fill the list once PhilScore
  runs out. The list stops at 30. PhilScore keeps the first 2 cards, so the untested algorithm never
  takes the top one.
- The card keeps its PhilScore chip if PhilScore found the pair and shows a small flask icon next to
  the SKU. Its tooltip says "Experimental suggestion from a new matching method".
- On the replay, page 1 gets an alternative in 39 % of single vision, 66 % of multifocal and 51 % of
  unsuccessful searches, 3 to 5 per 30 cards. About a quarter are pairs PhilScore doesn't find, the
  rest it ranks lower. Without "strictly less", blur's second choice would step in whenever its first
  is PhilScore's pick, and half the single vision alternatives would be no better than the pair they
  replace. When PhilScore finds nothing, a good blur pair exists in only 2 to 10 % of searches.
- `search_log.results` stores the shown list as JSON, e.g.
  `[{"id": 4711, "sku": 123, "algorithm": "blurscore"}]`, where `blurscore` marks an alternative.
  `result_count` stays PhilScore's count.
- After the campaign, read a database backup. Order searches by `search_date`, not `id`, since
  queued offline rows arrive late. Match each dispense one to one to the latest earlier search at the
  same site whose `results` contain its glasses `id`. Report how often an offered alternative was
  dispensed, per glasses type with a 95 % interval. About 900 pairs are dispensed per campaign, so
  roughly 450 searches offer one on page 1. Being third and marked experimental lowers the pick rate, so a low
  share doesn't show blur is worse, but a clear one shows its picks are wanted.

## Implementation

- `calculateAllBlurscore` takes the same arguments as `calculateAllPhilscore`. All parameters are in
  `BLUR_PARAMS`, so an optometrist's answer is a one-line change.
- Each result has its grade, each eye's blur as `odScore` and `osScore`, and per eye the focus
  error, leftover cylinder and reading error (`dM`, `2 * dJ`, `dNear`), so the UI can say why ("0.25
  too much minus, astigmatism fine").
- Ties go by the worse eye's blur, then SKU, so the order is stable.
- Multifocal lenses without an add are skipped, as PhilScore does.
- On the replay, it gives the prototype's scores for all 4,119 searches. It orders equal scores by
  the worse eye and SKU instead of float noise, which changes 7 first picks and none of the shares.
