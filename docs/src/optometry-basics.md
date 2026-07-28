# Optometry basics

The domain knowledge behind a prescription (`Rx`) and an `Eye` record: what the values mean, and why
[the matching algorithm](/philscore) is shaped the way it is. A pair only matches if both eyes fit
at once, which is why every value below is per eye.

## The four values per eye

Each eye (`OD` = right, `OS` = left) always uses 0.25 steps:

| Value        | Meaning                                       | Range                                                                              |
| ------------ | --------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Sphere**   | base lens power (diopters)                    | -20 to +20, usually -6 to +6. Negative = near-sighted, positive = far-sighted      |
| **Cylinder** | corrects astigmatism                          | 0 to -6, usually 0 to -3. Zero or negative only                                    |
| **Axis**     | orientation of the cylinder correction        | 0 to 180 (0 and 180 are the same, it wraps around). Meaningless when cylinder is 0 |
| **Add**      | extra plus power for reading, multifocal only | +0.25 to +4, usually +0.75 to +3.50                                                |

## Axis only makes sense together with cylinder

With no cylinder there's no orientation to have, so an axis value next to a zero cylinder is noise.
REIMS2 enforces this in `sanitizeEyeValues` (`frontend/src/util/eye-utils.ts`), which forces axis to
0 whenever cylinder is 0. Code that reads axis values from elsewhere (raw analysis of dispensed
glasses, say) should check cylinder first.

## Power vectors: measuring "how far apart" two axes are

Axis also wraps at 180, so it isn't an ordinary number line. The standard fix, from the optometric
literature, is to convert `(sphere, cylinder, axis)` into a **power vector**
(Thibos, Wheeler & Horner, 1997):

```
M   = S + C/2                  spherical equivalent
J0  = -(C/2) * cos(2 * axis)   with-the-rule / against-the-rule component
J45 = -(C/2) * sin(2 * axis)   oblique component
```

Doubling the axis angle handles the 180 wraparound exactly, and the vector's length shrinks to 0 as
cylinder does, matching the previous section. Euclidean distance in `(M, J0, J45)` space is optically
meaningful in a way raw sphere/cylinder/axis distance isn't.

This is also the reasoning behind `calcAxisTolerance`'s lookup table in `philscore.ts`. For two lenses
with the same cylinder `C` but axes `d` degrees apart, the uncorrected astigmatism left over is:

```
residual astigmatism = 2 * |C| * sin(d)
```

The same angular error `d` leaves more uncorrected astigmatism as `C` grows, so axis tolerance has to
shrink as cylinder grows too. REIMS2 doesn't compute power vectors at runtime; `calcAxisTolerance`'s
table is a hand-tuned approximation of a roughly constant astigmatism budget, but this is why it has
the shape it does.

## Sphere and cylinder trade off

`M = S + C/2` above also means sphere and cylinder aren't independent: reducing cylinder and adding
half that amount to sphere describes almost the same correction. A lens with less cylinder can
substitute for a prescription with more, given a sphere shift. `calcSphericalEquivalents` in
`philscore.ts` implements exactly this trade-off; see
[Matching Algorithm](/philscore#checkfortolerances) for the exact steps.

## One more asymmetry

Under-correcting a far-sighted (positive sphere) prescription is worse than the reverse.
`smallerLensSphereScore` in `philscore.ts` only penalizes that direction, leaving the symmetric case
alone.
