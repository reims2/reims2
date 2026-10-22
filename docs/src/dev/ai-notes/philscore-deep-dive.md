# PhilScore deep dive

Why each branch and constant of the matching algorithm exists, and where REIMS2 drifts from REIMS1,
as groundwork for improving it. [Matching Algorithm](/philscore) describes what `philscore.ts` does.

REIMS1 was designed by the late Dr. Philip Richmond, OD, and programmed by the late Skip Charles, so
no first-hand rationale survives. Sources are the decompiled FoxPro in the sibling
`reims1-decompiled` repo (`PROGS/RANK.prg`, `ATOLTF.prg`, `SPEQ.prg`, `SPEQXX.prg`,
`SCRNS/ASEARCH.spr`), the [REIMS manual](/reims-manual.pdf), the
[Working with REIMS](/working-with-reims.pdf) handout and the
[PhilScore breakdown](/philscore-breakdown.pdf). Claims are tagged **source** (read from REIMS1 code
or docs), **measured** (checked by running `philscore.ts` against the FoxPro: `ATOLTF` and `RANK`
compiled unmodified with the Harbour xBase compiler, the SQL filter through a TypeScript port) or
**inferred**.

The only stated intent, from the manual: rank candidates "by recognizing spherical equivalents,
sphere and cylinder differences and cylinder-driven axis tolerances."

## Summary

- The bonus rules are a hand-tuned approximation of the power-vector distance between Rx and lens
  (see [Optometry basics](/optometry-basics#power-vectors-measuring-how-far-apart-two-axes-are)).
  Per search, rank agreement with that distance (mean Kendall tau, equal axes) is 0.67 for plain
  `|dS| + |dC|` and 0.89 for the PhilScore, 0.82 for plus Rx because of the hyperope penalty.
  **measured**
- Little of it is down to slow hardware. FoxPro 2.6 dates from 1994, power vectors from 1997, and
  the rules encode what an optician does by hand. What is era-driven is FoxPro/SQL plumbing: one
  scalar sort column and rectangular `BETWEEN` windows. **inferred**
- Scoring and both filters match REIMS1 exactly over about 3.5 million Rx/lens combinations and
  every pair of axes, after two axis-filter bugs were fixed in October 2026. The one deliberate
  difference since is that a zero-cylinder Rx skips the axis filter. See
  [Where REIMS2 differs](#where-reims2-differs-from-reims1). **measured**

## How REIMS1 ran a search

`ASEARCH.spr` runs one SQL query per eye, then ranks (**source**):

```
SELECT * FROM glsku WHERE type = mtype AND atoltf(lensCyl, rxAxis, lensAxis)
  AND (lens within rx +-tol OR within SE candidate 1, 2 or 3 +-tol)   -- sphere and cyl BETWEEN
SELECT * FROM search WHERE BETWEEN(lensAdd, rxAdd - addTol, rxAdd + addTol)   -- bifocal only
SELECT *, rank(...) AS philscore FROM searchb ORDER BY 16   -- column 16 is philscore
```

The REIMS1 search screen had an OD/OS/Both selector, six separate tolerances (sphere, cylinder, add
per eye, default 0.5), "relax axis tolerances by N %", "ignore cylinder and axis" and "two single
vision pairs" (a distance pair, then a near pair at sphere + add, for a failed bifocal search).
REIMS2 folds the tolerances into one high-tolerance toggle and adds BAL, which REIMS1 didn't have.
A one-eye search in REIMS1 left the other eye unconstrained and unscored, while REIMS2's BAL still
filters that eye against the other eye's Rx at +-1.0.

## The filter

| Element                | Value                                                              | Why                                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sphere/cylinder window | +-0.5 D                                                            | Default of the editable tolerances, "half-diopter tolerances" in the manual. **source**                                                                                                                  |
| SE step                | sphere -0.25 per cylinder +0.5                                     | Keeps `S + C/2` constant on the 0.25 grid. A 0.25 cylinder step would need a 0.125 sphere step, which the handout leaves to judgement. **source**                                                        |
| SE candidates          | at most 3 (1.5 D cylinder removed), only while cylinder stays <= 0 | A clinical cap, not a compute limit: the "Spherical equivalents" screen (`SPEQXX.prg`) loops all the way to cylinder 0. The handout: "maintain as much of the original cylinder as possible". **source** |
| Unused SE slot         | sphere and cylinder 10                                             | FoxPro sentinel, cylinder +10 never matches. **source**                                                                                                                                                  |
| Axis tolerance         | table by lens cylinder, 90 at cylinder 0                           | See [Axis table](#axis-table). A spherical lens has no axis, so 90 accepts any. **source**                                                                                                               |
| Relax axis %           | `round((1 + p/100) * tol)`, not applied to 90                      | REIMS2 high tolerance doubles it, which is p = 100. **source**                                                                                                                                           |
| Add window             | +-0.5 D                                                            | Same default as the others. **source**                                                                                                                                                                   |

### Axis table

Two equal cylinders `C` crossed by `d` degrees leave `2 * |C| * sin(d)` of astigmatism. Applied to
`ATOL.prg` (**measured**):

| Lens cylinder             | -0.25 | -0.5 | -0.75 | -1.0 | -1.25 | -1.5 | -2.0 | -2.5 | -3.0 | -4.0 |
| ------------------------- | ----- | ---- | ----- | ---- | ----- | ---- | ---- | ---- | ---- | ---- |
| Tolerance (deg)           | 35    | 25   | 20    | 15   | 13    | 10   | 9    | 8    | 8    | 7    |
| Residual (D)              | 0.29  | 0.42 | 0.51  | 0.52 | 0.56  | 0.52 | 0.63 | 0.70 | 0.84 | 0.97 |
| ANSI Z80.1 new lens (deg) | 14    | 7    | 5     | 3    | 3     | 3    | 2    | 2    | 2    | 2    |

The budget isn't constant. It holds about 0.5 D through the common range, then turns relative for
high cylinders, where the lens still corrects about 70 % of the astigmatism. It's 3 to 5 times looser
than the tolerance for a new lens, which fits donated glasses. Every value stays below 30 degrees,
where crossed cylinders stop beating no cylinder at all. **inferred**

Keying on the lens cylinder is half right: axis error only matters when both lens and Rx have
cylinder. REIMS1 handles lens cylinder 0 but not Rx cylinder 0. Its axis is then a meaningless 0, and
the filter still demands lenses near 0/180 (the [2024 zero-cylinder case](/2024_bugs_investigated)).
REIMS2 skips the filter for it, see below.
`SPEQXX.prg` gives each SE candidate its own axis tolerance from its reduced cylinder, so the intent
looks like "the cylinder actually worn decides how much axis error matters". **inferred**

## The score

`RANK.prg` per eye, both eyes summed (**source**):

| Term             | Value                                | Why                                                                                                                                                                              |
| ---------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base             | `abs(dS) + abs(dC)`                  | Diopter error, sphere and cylinder weighted equally.                                                                                                                             |
| Add              | `abs(dAdd) / 10`                     | Add error counts little: at most 0.05 inside the +-0.5 window.                                                                                                                   |
| Axis             | `min(dA, 180 - dA) / 3600`           | A tiebreaker. The worst case, 90 degrees, adds 0.025, a tenth of a 0.25 D step, and within the filter it's under 0.01. The filter already judged axis.                           |
| Rules 1 to 3     | first match only                     | FoxPro `DO CASE`, see below.                                                                                                                                                     |
| Higher add       | `-(lensAdd - rxAdd) / 100`           | Not a net bonus: over-add costs 0.09 per diopter against 0.1 for under-add. A presbyope can read with too much add by holding the page closer, not with too little. **inferred** |
| Hyperope penalty | +0.25 if `rxS > 0` and `lensS < rxS` | Under-plus forces accommodation that presbyopes lack ("maximum plus"). The mirror case, over-minus for a myope, isn't penalized. **inferred**                                    |

### Rules 1 to 3 are one classification

With `dS = lensS - rxS` and `dC = lensC - rxC` (positive `dC` means less cylinder), the rules sort
the error by direction:

- **Equal sphere** (`dS = 0`, `0 < abs(dC) <= 0.75`): -0.12. A cylinder error moves SE by only half
  its size, so "sphere exact, cylinder off 0.25" (0.13) beats "sphere off 0.25" (0.25). Power-vector
  distance agrees: 0.18 versus 0.25. Why the cutoff is 0.75 is unknown.
- **Contrary** (`dS` and `dC` have opposite signs): the two errors partly cancel in SE. The bonus is
  0.25 for `abs(dC) = 0.25` and 0.5 from 0.5 up. It grows with the cylinder error because in this
  direction more cylinder error cancels more SE error.
- **+0.05 when `abs(dS) = abs(dC)`**: a tiebreak. Without it, sphere and cylinder both off 0.25 in
  opposite directions ties with sphere alone off 0.25, although its SE error is half as big. Same at
  0.5.
- **SE** (`dS = -dC/2`, `dS < 0`, `abs(dC) <= 1`): exactly on the SE line, with less cylinder. This
  is a strict subset of the contrary case, which already gives 0.5 there, so the SE rule changes
  nothing for minus and plano lenses. For plus lenses it adds 0.05. **measured**

REIMS1 has a separate `lensS > 0` branch for all three rules, but the 0.55/0.50 SE value is the only
difference. The other two are the same conditions with operands swapped, probably left over from an
earlier version. **inferred**

Equal sphere can't co-occur with the other two, so first-match only matters for SE versus contrary.
Stacking those would count the same cancellation twice and push 720 of 1,372 SE cases below zero.
First-match keeps the invariant that 0 means a perfect match: anything imperfect scores at least
0.13. **measured** REIMS1 checks equal sphere second and contrary third, `philscore.ts` the other way
round, which changes nothing.

### Score against power-vector distance

PhilScore / power-vector distance for Rx -1.50 -1.50 (equal axes, "." is filtered out). Bold cells
lie on the SE line (**measured**):

| dS \ dC | -0.5          | -0.25     | 0         | +0.25     | +0.5          | +1.0          | +1.5          |
| ------- | ------------- | --------- | --------- | --------- | ------------- | ------------- | ------------- |
| -0.75   | .             | .         | 0.75/0.75 | 0.75/0.64 | 0.75/0.56     | 1.25/0.56     | **1.75/0.75** |
| -0.5    | 1.00/0.79     | 0.75/0.64 | 0.50/0.50 | 0.50/0.40 | 0.45/0.35     | **1.00/0.50** | 1.50/0.79     |
| -0.25   | 0.75/0.56     | 0.50/0.40 | 0.25/0.25 | 0.20/0.18 | **0.25/0.25** | 0.75/0.56     | 1.25/0.90     |
| 0       | 0.38/0.35     | 0.13/0.18 | 0/0       | 0.13/0.18 | 0.38/0.35     | 1.00/0.71     | 1.50/1.06     |
| +0.25   | **0.25/0.25** | 0.20/0.18 | 0.25/0.25 | 0.50/0.40 | 0.75/0.56     | 1.25/0.90     | .             |
| +0.5    | 0.45/0.35     | 0.50/0.40 | 0.50/0.50 | 0.75/0.64 | 1.00/0.79     | .             | .             |

Near the center the two agree closely. The flat SE bonus stops crediting exact SE beyond 0.5 D of
cylinder removed: `-2.00 -0.50` (exact SE) and `-1.50 -0.50` (SE off by 0.5) both score 1.00. That
fits "keep as much cylinder as possible", but makes exact and wrong SE indistinguishable. For a plus
Rx, the whole `dS < 0` half shifts up by 0.25, SE substitutions included.

## Era-driven or not

Driven by FoxPro and SQL (**inferred**):

- One scalar sort key. `ORDER BY 16` sorts a single column, so add and axis are folded in with small
  weights instead of a multi-key sort. Not strictly lexicographic: two-eye sums can differ by 0.01,
  less than a 0.25 D add difference adds.
- Rectangles instead of a distance. The SE filter is four `BETWEEN` boxes on raw columns that
  together approximate a band along the SE line.
- Sentinels, per-eye copy-paste, `=` on floats (safe, multiples of 0.25 are exact in binary).

Not driven by hardware (**inferred**):

- The bonus rules. FoxPro has `SQRT()` and `COS()`, but there was no standard metric to compute yet.
- The axis table, a clinical step table shaped like ANSI Z80.1's.
- The SE cap and the 0.5 tolerances, clinical choices `SPEQXX.prg` shows they could have exceeded.
- Filtering itself. An empty result is also what logs an unsuccessful search, then and now.

## Where REIMS2 differs from REIMS1

Checked over sphere -5 to +5, cylinder 0 to -4, lens offsets up to 2 D, several add pairs, both
tolerance modes, and every pair of axes 0 to 180 (**measured**). Two axis-filter bugs from the
first port (August 2021) were fixed in October 2026, with tests in `philscore_filtering.test.ts`:

- **A lens with axis 0 skipped the axis filter.** Without wraparound, the second range was `[0, 0]`
  where REIMS1 used `[999, 999]`, so axis 0 passed for every Rx axis. `sanitizeEyeValues` stores an
  entered 180 as 0, so this hit every horizontal-axis lens added through REIMS2. Rx
  `0.00 -1.50 x 90` matched lens `0.00 -1.50 x 180` with score 0.05, although that lens is 90
  degrees off and leaves about 3 D of astigmatism. Only 0.7 % of cylinder eyes were stored at axis
  0, so the impact stayed small. Replaying each pair dispensed in 2023 to 2026 as an Rx against the
  stock of that moment, such a lens was the #1 suggestion in 0.8 % of searches, mostly far enough
  off to leave more astigmatism than no cylinder at all. Axis-0 pairs with more than 0.50 D cylinder
  were dispensed 3 times as often as near-horizontal ones. That's too few pairs to explain the "need
  more zero-ish axis" finding in [Inventory analysis](/inventory-analysis).
- **The axis table was shifted at two places.** Cylinder -2.25 got 8 degrees instead of 9, and
  -3.25 to -3.75 got 7 instead of 8.

One deliberate difference was added in October 2026: **a zero-cylinder Rx skips the axis filter.**
With no astigmatism to correct, a lens cylinder leaves the same residual whatever its axis, so
`-0.50 x 90` and `-0.50 x 180` are equivalent for this patient, yet REIMS1 only took the second.
The sphere/cylinder window still caps the lens cylinder at 0.50 D (1.00 D with high tolerance), as
before. Replayed against the stock of that moment, about half of the 754 unique unsuccessful
searches from 2024 to 2026 now find a pair. Among dispensed pairs replayed as Rx, 34 % (multifocal)
to 50 % (single) have a zero-cylinder eye, and the first suggestion changes in 16 to 19 % of
searches. The change only adds pairs, no search lost one. **measured**

Two minor differences remain:

- **Input rounding.** `sanitizeEyeValues` rounds away from zero, REIMS1's `QTRINC` to the nearest
  quarter, so 1.1 becomes 1.25 instead of 1.00. Irrelevant for quarter-step input.
- **Ties sort arbitrarily.** The comparator returns -1 for equal scores, which isn't a valid
  comparator. REIMS1 didn't define a tie order either.

## Faithful quirks worth revisiting

REIMS1 behaves the same way here:

- The hyperope penalty also hits SE substitutions whose SE is exact.
- SE substitutions beyond 0.5 D of cylinder get no credit for exact SE (see above).
- Over-minus for a myope is free.
- A spherical lens, or any lens for a zero-cylinder Rx, collects an axis term against a meaningless
  axis, at most 0.025.
- Each eye is scored alone and summed, so nothing weighs how the errors of both eyes relate.
