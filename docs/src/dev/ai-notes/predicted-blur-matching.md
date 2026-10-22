# Predicted-blur matching

A second matching algorithm, meant to run next to PhilScore on the same search so volunteers can
compare both, and maybe merge them later. Nothing is implemented yet. It works out proposal 7 of
[PhilScore improvement ideas](/dev/ai-notes/philscore-improvements), which also has the literature.
How results are compared, shown and logged is decided elsewhere.

## Summary

- One number per pair: the blur the patient is predicted to see, in diopters (D). Lower is better.
  Volunteers see it as a grade.
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

| Approach                        | Why not                                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Improve PhilScore step by step  | Ranks almost like PhilScore, so volunteers would have nothing to compare.                                                       |
| Predicted acuity (20/xx)        | Same ranking with more assumptions (pupil size, age). Could be shown on top of this later.                                      |
| Arnold 2021 A/B/C grades        | Needs age and pupil distance, some formulas unpublished, about 10 subjects. Its relief for high cylinder is borrowed below.     |
| Percent match, like ReSpectacle | Relative to the Rx, so it rates a -6.00 that's 0.75 off as good and a -0.75 that's 0.25 off as poor, though the first is worse. |

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

- `w`: astigmatic blur costs about twice the acuity of defocus per unit of blur strength (Atchison
  2011, Mathur 2015). With `w = 2`, `astig` is the leftover cylinder for a low-cylinder Rx.
- `k`: patients with high cylinder see less sharply even when fully corrected and often get reduced
  cylinder. Arnold 2021's fit for donated glasses grows the tolerated error at this rate, and
  REIMS1's axis table has the same shape.
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

| Score  | Grade     | Meaning, after Atchison 2005 |
| ------ | --------- | ---------------------------- |
| ≤ 0.25 | excellent | below noticeable blur        |
| ≤ 0.50 | good      | below troublesome blur       |
| ≤ 0.75 | fair      | around objectionable blur    |
| ≤ 1.25 | poor      | high tolerance only          |

Sort by score. A refraction repeats to about ±0.25 D, so pairs within one grade are close to
equivalent.

## Parameters

| Name                             | Default          | Basis                                                                                            |
| -------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| `w`, astigmatism weight          | 2                | Acuity data. Blur-limit data (Guo 2010) would give 1.4.                                          |
| `k`, high-cylinder relief        | 2                | Arnold 2021 (about 1.8). Without it, 10 % of single vision searches find nothing instead of 3 %. |
| `m`, extra minus on plus Rx      | 1.5              | Arnold 2021's age formula at 55 to 60.                                                           |
| `n`, too much reading power      | 0.75             | Clinical judgement.                                                                              |
| `e`, worse-eye share             | 0.75             | Judgement.                                                                                       |
| Balance free, slope, drop        | 0.25, 0.5, 1.0 D | Ready-made trials, Skov 2026.                                                                    |
| No-harm margin per eye           | 0.25 D           | One quarter step.                                                                                |
| BAL lens SE difference           | 1.0 D            | PhilScore's BAL tolerance.                                                                       |
| Limit, normal and high tolerance | 0.75 D, 1.25 D   | Objectionable blur. Gives match counts close to PhilScore's in the [replay](#replay).            |

## Worked examples

PhilScore sums both eyes, so compare the order, not the values. Same lens on both eyes unless noted.
These make good unit tests.

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
pair itself removed from stock. PhilScore includes the zero-cylinder fix. The prototype and scripts
were throwaway.

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

## Open questions for optometrists

- The [parameters](#parameters), especially `w`, `k` and `m`.
- Age. Simulated on the replay, knowing it would change the first pick in 17 to 35 % of searches for
  clearly young or old patients, mostly between 0.25 too much plus and 0.25 too much minus. It never
  changes whether a match exists, so it's left out. An "under 40" checkbox on single vision searches
  would capture most of it.
- Should a lens with more cylinder than the Rx cost extra? It distorts more for first-time wearers,
  but we don't know who they are.
- Is the worse of distance and reading right for a multifocal, or should distance count more?

## Left to the builder

- A module next to `frontend/src/lib/philscore.ts` with the same signature as
  `calculateAllPhilscore`. All parameters in one exported object, so an optometrist's answer is a
  one-line change.
- Return `dM`, `2 * dJ` and `dNear` per eye with each result, so the UI can say why ("0.25 too much
  minus, astigmatism fine").
- Break ties by the worse eye's blur, then SKU, so the order is stable.
- Skip multifocal lenses without an add, as PhilScore does.
