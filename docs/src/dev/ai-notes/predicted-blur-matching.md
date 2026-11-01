# Predicted-blur matching

A second matching algorithm, in `frontend/src/lib/blurscore.ts`. The Find page runs it next to
PhilScore on every search and offers some of its picks as experimental suggestions, to find out
whether volunteers take them. It works out proposal 7 of
[PhilScore improvement ideas](/dev/ai-notes/philscore-improvements), which also has the literature.

## Summary

- One number per pair: how blurry the worse eye sees through the lens, as the blur strength of the
  error left uncorrected, in diopters (D). Lower is better.
- Same inputs as PhilScore, no new fields, runs offline in the browser.
- Power vectors replace the axis table, the spherical equivalent (SE) candidates, the three bonus
  rules and the add window. Its only parameters are five exclusion thresholds.
- It finds a match as often as PhilScore, but picks a different first pair in half of single vision
  and three quarters of multifocal searches. The clearest differences are reading power and balance
  between the eyes.

Replacing PhilScore is not a goal, nor are pupil distance, prism and frame fit, which have no data.
Differences below a quarter diopter, the precision of a refraction, aren't treated as meaningful.

## Algorithm

Convert Rx and lens to power vectors (see
[Optometry basics](/optometry-basics#power-vectors-measuring-how-far-apart-two-axes-are)):

```text
M   = S + C/2
J0  = -(C/2) * cos(2 * axis)
J45 = -(C/2) * sin(2 * axis)

dM     = M_lens - M_rx                      focus error
dJ     = |(J0, J45)_lens - (J0, J45)_rx|    leftover cylinder is 2 * dJ
dNear  = dM + (add_lens - add_rx)           multifocal only

b_dist = sqrt(dM^2 + dJ^2)
b_near = sqrt(dNear^2 + dJ^2)
b_eye  = max(b_dist, b_near)                b_dist for single vision
score  = max(b_od, b_os)
```

`b_dist` is the blur strength of the leftover error (Thibos 1997). Leftover cylinder counts with half
its power, as in the SE rule, and too much plus counts the same as too much minus. A presbyope reads
through sphere plus add, so `+1.25 add +2.25` reads like `+1.00 add +2.50`.

There are no extra weights, for these reasons:

- Astigmatism. Blur limits, pooled acuity data and studies of real cylinder errors all fit blur
  strength as it is (Atchison 2009, Guo 2010, Blendowske 2015, Remón 2017, Reddy 2017, Weisensee
  2026). Only acuity with small induced crossed cylinders costs about twice as much (Atchison 2011,
  Mathur 2015, 8 and 22 subjects).
- High Rx cylinder. Tolerance grows with it (Arnold 2021), but differently for errors in power and in
  axis, so one relief factor can't capture it.
- Focus direction. A young eye focuses through extra minus, a presbyope can't, and REIMS doesn't
  record age.
- Reading power direction. Holding the page closer makes up for too much, but narrows the range of
  clear vision.

A pair is dropped if:

- `|dM_od - dM_os| > 1.0`. Both eyes focus by the same amount, so opposite focus errors can't both
  be cleared. Ready-made glasses trials allow up to 1 D, and induced anisometropia just under 1 D is
  well tolerated (Skov 2026).
- an eye ends up more than 0.25 D blurrier than with no glasses, or the score isn't lower than for
  plano lenses. This decides whether a weak pair is shown at all for low prescriptions, e.g. `-1.00`
  for a `-0.50` myope.
- the score exceeds 0.75, or 1.25 with high tolerance. That's objectionable blur (Atchison 2005).

A BAL eye isn't scored, and its lens SE must be within 1.0 D of the other lens's SE, so the pair looks
and weighs alike.

| Score  | Grade     | Meaning, after Atchison 2005 | Best acuity kept, Blendowske 2015 |
| ------ | --------- | ---------------------------- | --------------------------------- |
| ≤ 0.25 | excellent | below noticeable blur        | 94 % or more                      |
| ≤ 0.50 | good      | below troublesome blur       | 80 %, about 1 line lost           |
| ≤ 0.75 | fair      | around objectionable blur    | 64 %, about 2 lines lost          |
| ≤ 1.25 | poor      | high tolerance only          | 39 %, about 4 lines lost          |

A refraction repeats to about ±0.25 D, so pairs within one grade are close to equivalent.

## Examples

PhilScore sums both eyes, so compare the order, not the values. Same lens on both eyes unless noted.

| Rx                 | Lens                                  | PhilScore | Blur                          |
| ------------------ | ------------------------------------- | --------- | ----------------------------- |
| `-1.50 -1.50 x 90` | axis 10 degrees off                   | 0.01      | 0.26 good                     |
|                    | `-2.00 -0.50`, exact SE               | 2.00      | 0.50 good                     |
| `+1.00 add +2.50`  | `+1.00 add +2.00`                     | 0.10      | 0.50 good                     |
|                    | `+1.25 add +2.25`, same reading power | 0.55      | 0.25 excellent                |
| `-0.50` both eyes  | `-1.00`, high tolerance               | 1.00      | dropped, not better than none |

## Replay

Data from dev.reims2.app in October 2026, with the stock rebuilt for each moment from creation and
dispense dates. Each of the 3,365 pairs dispensed in 2023 to 2026 served as a stand-in Rx, with the
pair itself removed from stock.

| Measure                                                         | Single vision  | Multifocal     |
| --------------------------------------------------------------- | -------------- | -------------- |
| Searches with a match, blur and PhilScore                       | 98 %, 98 %     | 100 %, 99 %    |
| Same first pick                                                 | 50 %           | 27 %           |
| PhilScore's first pick graded excellent or good                 | 87 %           | 65 %           |
| First picks: worse eye's blur strength, PhilScore and blur      | 0.27 D, 0.23 D | 0.43 D, 0.29 D |
| First picks leaving 0.50 D cylinder or more, PhilScore and blur | 37 %, 40 %     | 36 %, 44 %     |
| Different first picks: reading power error, PhilScore and blur  | -              | 0.43 D, 0.18 D |
| Different first picks: eye imbalance, PhilScore and blur        | 0.23 D, 0.14 D | 0.20 D, 0.15 D |

Of the 687 unique unsuccessful searches from 2024 to 2026, blur finds a pair for 56 % and PhilScore
for 50 %. Blur returns two to three times as many pairs, most of the extra ones graded fair. Blur
strength is what blur minimizes, so that row favours it, and its first picks leave more cylinder. The
stand-in Rx are lenses, not prescriptions, so this shows how the two differ, not which is better.

## Open questions for optometrists

- Should dropped cylinder cost more than its blur strength? Acuity says no. Side by side with full
  correction, though, only 43 % were comfortable with 0.50 D dropped and 19 % with 1.00 D (Reddy
  2017), although nobody returned their SE glasses later. A milder premium would match 97 % of Rx with
  more than 2 D cylinder instead of 90 %, and cut the median matches by about a third.
- Age. It would change the first pick for clearly young or old patients in 17 to 35 % of searches,
  but never whether a match exists, so it's left out. An "under 40" checkbox on single vision searches
  would capture most of it.
- Should a lens with more cylinder than the Rx cost extra? It distorts more for first-time wearers,
  but we don't know who they are.
- Is the worse of distance and reading right for a multifocal, or should distance count more?

## Comparison with PhilScore

The Find page keeps PhilScore's list, but every third row goes to blur's best unlisted pair graded
good or better, if blur predicts strictly less blur for it than for PhilScore's pick. Such pairs also
fill the list once PhilScore runs out. PhilScore keeps the first 2 rows, so the untested algorithm
never takes the top one.

On the replay, the first 3 rows hold an alternative in 39 % of single vision, 66 % of multifocal and
51 % of unsuccessful searches. About a quarter are pairs PhilScore doesn't find, the rest it ranks
lower.

After the campaign, read a database backup, where `search_log.results` holds each search's shown list.
Order searches by `search_date`, not `id`, since queued offline rows arrive late. Match each dispense
one to one to the latest earlier search at the same site whose `results` contain its glasses `id`.
Report how often an offered alternative was dispensed, per glasses type with a 95 % interval. About
900 pairs are dispensed per campaign, so roughly 450 searches offer one in the first 3 rows. Being
third and marked experimental lowers the pick rate, so a low share doesn't show blur is worse, but a
clear one shows its picks are wanted.

## Earlier versions

The first version had twelve parameters: a weight of 2 on leftover astigmatism, extra costs for the
direction of focus and reading errors, and a weighted mix of the two eyes. The astigmatism weight
leaned on the least representative acuity studies. A replay that removed the others one at a time
showed they mostly changed picks within a grade, and no study shows a cost for imbalance below 1 D.

Never built: improving PhilScore step by step (it would rank like PhilScore, leaving nothing to
compare), predicted acuity in 20/xx (needs best-corrected acuity, which isn't recorded), a percent
match like ReSpectacle (unpublished, and it rates a -6.00 that's 0.75 off above a -0.75 that's 0.25
off) and Arnold 2021b's A/B/C grade (needs age and pupil distance, fitted on 8 to 10 subjects).
