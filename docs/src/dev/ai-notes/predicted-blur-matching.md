# Predicted-blur matching

A second matching algorithm, meant to run next to PhilScore on the same search so volunteers can
compare both, and maybe merge them later. It's implemented in `frontend/src/lib/blurscore.ts`, but
not shown in the UI yet. It works out proposal 7 of
[PhilScore improvement ideas](/dev/ai-notes/philscore-improvements), which also has the literature.
How results are compared, shown and logged is decided elsewhere.

## Summary

- One number per pair: how blurry the worse eye sees through the lens, as the blur strength of the
  error left uncorrected, in diopters (D). Lower is better. Volunteers see it as a grade.
- Same inputs as PhilScore, no new fields, runs offline in the browser.
- Power vectors replace the axis table, the spherical equivalent (SE) candidates, the three bonus
  rules and the add window. Its only parameters are five exclusion thresholds.
- It finds a match as often as PhilScore, but picks a different first pair in half of single vision
  and three quarters of multifocal searches. The clearest differences are reading power and balance
  between the eyes.

Replacing PhilScore is not a goal, nor are pupil distance, prism and frame fit, which have no data.
Differences below a quarter diopter, the precision of a refraction, aren't treated as meaningful.

## Algorithm

Inputs are sanitized as for PhilScore (`sanitizeEyeValues`), and only glasses of the searched type
are considered.

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

### 2. Blur per eye

```text
b_dist = sqrt(dM^2 + dJ^2)

dNear  = dM + (add_lens - add_rx)        multifocal only
b_near = sqrt(dNear^2 + dJ^2)
b_eye  = max(b_dist, b_near)             b_dist for single vision
```

`b_dist` is the blur strength of the leftover error (Thibos 1997), also called dioptric distance. In
clinical terms, leftover cylinder counts with half its power, as in the SE rule, and too much plus
counts the same as too much minus. A presbyope reads through sphere plus add, so `+1.25 add +2.25`
reads like `+1.00 add +2.50`, and a multifocal is judged by the worse of distance and reading.

There are no extra weights, for these reasons:

- Astigmatism. Blur limits, pooled acuity data and studies of real cylinder errors all fit blur
  strength as it is (Atchison 2009, Guo 2010, Blendowske 2015, Remón 2017, Reddy 2017, Weisensee
  2026). In Weisensee's 75 eyes after cataract surgery, the mixed astigmatism an exact-SE lens leaves
  cost 0.24 logMAR per diopter of blur strength, mostly spherical errors 0.29. Only acuity with small
  induced crossed cylinders costs about twice as much (Atchison 2011, Mathur 2015, 8 and 22
  subjects).
- High Rx cylinder. Arnold 2021's tolerance grows with the Rx cylinder, but faster for errors in
  cylinder power than in axis, as Vinas 2013's astigmats were adapted to their own axis. One relief
  factor can't capture that, and Rx with more than 2 D cylinder still find a pair in 90 % of
  searches without one.
- Focus direction. A young eye focuses through extra minus, a presbyope can't, and REIMS doesn't
  record age.
- Reading power direction. Holding the page closer makes up for too much, but narrows the range of
  clear vision.

### 3. Pair score and exclusions

```text
score = max(b_od, b_os)
```

A pair is judged by its worse eye. Drop it if:

- `|dM_od - dM_os| > 1.0`. Both eyes focus by the same amount, so opposite focus errors can't both
  be cleared. Below that, imbalance costs nothing: ready-made glasses trials allow up to 1 D, and
  induced anisometropia just under 1 D is well tolerated (Skov 2026).
- an eye ends up more than 0.25 D blurrier than with no glasses (`b_eye` of a plano lens, add 0),
- the score isn't lower than for plano lenses, or
- the score exceeds the limit: 0.75, or 1.25 with high tolerance.

The no-glasses rules matter for low prescriptions, e.g. `-1.00` for a `-0.50` myope. They rarely
change the first pick, but decide whether a weak pair is shown at all.

The form allows at most one BAL eye. That eye isn't scored, and its lens SE must be within 1.0 D of
the other lens's SE, so the pair looks and weighs alike. The score is the other eye's `b_eye`, and
the exclusions apply to that eye.

### 4. Grades and order

| Score  | Grade     | Meaning, after Atchison 2005 | Best acuity kept, Blendowske 2015 |
| ------ | --------- | ---------------------------- | --------------------------------- |
| ≤ 0.25 | excellent | below noticeable blur        | 94 % or more                      |
| ≤ 0.50 | good      | below troublesome blur       | 80 %, about 1 line lost           |
| ≤ 0.75 | fair      | around objectionable blur    | 64 %, about 2 lines lost          |
| ≤ 1.25 | poor      | high tolerance only          | 39 %, about 4 lines lost          |

Sort by score, then by the better eye, then by SKU. A refraction repeats to about ±0.25 D, so pairs
within one grade are close to equivalent. The acuity column is Blendowske's `1 / (1 + score^2)`,
fitted to pooled sphere and cylinder data with a coefficient of 1.02 (0.91 to 1.14) on `score^2`,
so the UI can show it for any score.

## Parameters

| Name                             | Default        | Basis                                                                                                 |
| -------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| Imbalance drop                   | 1.0 D          | Ready-made trials, Skov 2026.                                                                         |
| No-harm margin per eye           | 0.25 D         | One quarter step.                                                                                     |
| BAL lens SE difference           | 1.0 D          | PhilScore's BAL tolerance.                                                                            |
| Limit, normal and high tolerance | 0.75 D, 1.25 D | Objectionable blur (Atchison 2005), which blur strength measures for astigmatism too (Atchison 2009). |

## Worked examples

PhilScore sums both eyes, so compare the order, not the values. Same lens on both eyes unless noted.
They're unit tests in `frontend/src/test/blurscore.test.ts`. Errors within a quarter step tie.

| Rx                  | Lens                                  | PhilScore | Blur                          |
| ------------------- | ------------------------------------- | --------- | ----------------------------- |
| `-1.50 -1.50 x 90`  | axis 10 degrees off                   | 0.01      | 0.26 good                     |
|                     | sphere 0.25 off                       | 0.50      | 0.25 excellent                |
|                     | `-1.75 -1.00`, exact SE               | 0.50      | 0.25 excellent                |
|                     | `-2.00 -0.50`, exact SE               | 2.00      | 0.50 good                     |
| `-1.00 -3.00 x 180` | axis 8 degrees off                    | 0.00      | 0.42 good                     |
| `+2.00 -1.00 x 90`  | `+1.75 -0.50`, exact SE               | 0.90      | 0.25 excellent                |
|                     | `+2.25 -1.00`, 0.25 too much plus     | 0.50      | 0.25 excellent                |
|                     | `+1.75 -1.00`, 0.25 too much minus    | 1.00      | 0.25 excellent                |
| `+1.00 add +2.50`   | `+1.00 add +2.00`                     | 0.10      | 0.50 good                     |
|                     | `+1.25 add +2.25`, same reading power | 0.55      | 0.25 excellent                |
| `-2.00` both eyes   | `-2.25` and `-2.25`                   | 0.50      | 0.25 excellent                |
|                     | `-2.25` and `-1.75`                   | 0.50      | 0.25 excellent                |
| `-0.50` both eyes   | `-1.00`, high tolerance               | 1.00      | dropped, not better than none |

## Replay

Data from dev.reims2.app in October 2026, with the stock rebuilt for each moment from creation and
dispense dates. Each of the 3,365 pairs dispensed in 2023 to 2026 served as a stand-in Rx, with the
pair itself removed from stock. PhilScore includes the zero-cylinder fix.

| Measure                                                         | Single vision  | Multifocal     |
| --------------------------------------------------------------- | -------------- | -------------- |
| Searches with a match, blur and PhilScore                       | 98 %, 98 %     | 100 %, 99 %    |
| Median matches, blur and PhilScore                              | 67, 32         | 130, 46        |
| Same first pick                                                 | 50 %           | 27 %           |
| PhilScore's first pick in blur's top 3                          | 74 %           | 44 %           |
| PhilScore's first pick graded excellent or good                 | 87 %           | 65 %           |
| First picks: worse eye's blur strength, PhilScore and blur      | 0.27 D, 0.23 D | 0.43 D, 0.29 D |
| First picks leaving 0.50 D cylinder or more, PhilScore and blur | 37 %, 40 %     | 36 %, 44 %     |
| Different first picks: reading power error, PhilScore and blur  | -              | 0.43 D, 0.18 D |
| Different first picks: eye imbalance, PhilScore and blur        | 0.23 D, 0.14 D | 0.20 D, 0.15 D |

Of the 687 unique unsuccessful searches from 2024 to 2026, blur finds a pair for 56 % and PhilScore
for 50 %. Blur returns two to three times as many pairs, most of the extra ones graded fair, because
leftover cylinder counts with half its power and multifocals have no fixed add window. Blur strength
is what blur minimizes, so that row favours it, and its first picks leave more cylinder. The
stand-in Rx are lenses, not prescriptions, so this shows how the two differ, not which is better.

## Open questions for optometrists

- Should dropped cylinder cost more than its blur strength? Acuity says no. Side by side with full
  correction, though, only 43 % were comfortable with 0.50 D dropped and 19 % with 1.00 D (Reddy
  2017), although nobody returned their SE glasses later. See [Earlier versions](#earlier-versions)
  for what a premium would change.
- Age. Simulated on the first version, knowing it would change the first pick for clearly young or
  old patients in 17 to 35 % of searches, mostly between 0.25 too much plus and 0.25 too much minus.
  It never changes whether a match exists, so it's left out. An "under 40" checkbox on single vision
  searches would capture most of it.
- Should a lens with more cylinder than the Rx cost extra? It distorts more for first-time wearers,
  but we don't know who they are.
- Is the worse of distance and reading right for a multifocal, or should distance count more?

## Implementation

- `calculateAllBlurscore` takes the same arguments as `calculateAllPhilscore`. All thresholds are in
  `BLUR_PARAMS`.
- Each result has its grade, each eye's blur as `odScore` and `osScore`, and per eye the focus
  error, leftover cylinder and reading error (`dM`, `2 * dJ`, `dNear`), so the UI can say why ("0.25
  too much minus, astigmatism fine").
- Multifocal lenses without an add are skipped, as PhilScore does.

## Earlier versions

The first version, also October 2026, had twelve parameters. A replay that removed one at a time
showed which ones mattered:

- Leftover astigmatism weighted by 2, after the induced-blur acuity studies, the least representative
  end of the evidence. The weight shrank for high Rx cylinder as `2 / (1 + |C_rx| / 2)`, after Arnold
  2021a, which only mattered against the weight of 2. A milder premium, `1.41 / (1 + |C_rx| / 3.6)`,
  would leave 0.50 D cylinder or more in 37 % and 38 % of first picks instead of 41 % and 45 %, match
  97 % of Rx with more than 2 D cylinder instead of 90 %, and cut the median matches from 67 and 130
  to 47 and 90.
- Extra minus on a plus single vision Rx costing 1.5 times, and too much reading power 0.75 times as
  much. Removing them changed 3 % and 9 % of first picks, most within 0.25 D.
- The worse eye counting 75 % and the better 25 %, plus 0.5 per diopter of imbalance beyond 0.25.
  Removing them changed 12 to 15 % and 10 to 12 % of first picks, mostly within a grade, and no study
  shows a cost for imbalance below 1 D.

Alternatives that were never built: improving PhilScore step by step (it would rank like PhilScore,
leaving volunteers nothing to compare), predicted acuity in 20/xx (needs best-corrected acuity, which
isn't recorded) and a percent match like ReSpectacle (unpublished, and a percent of the Rx rates a
-6.00 that's 0.75 off above a -0.75 that's 0.25 off). Arnold 2021b's A/B/C grade needs age and pupil
distance and was fitted on 8 to 10 subjects. Run as a matcher on the replay, it agreed with
PhilScore's first pick in 29 to 37 % of searches, but gave an eye 0.50 D or more of extra plus in 19
to 25 % of them, against 6 % for PhilScore, because it counts 1 D of extra plus as one lost line.
