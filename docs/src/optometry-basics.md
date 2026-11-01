# Optometry basics

What the values of a prescription mean. A pair only matches if both eyes fit, so every value is per eye.

## The four values per eye

Each eye (`OD` = right, `OS` = left) uses steps of 0.25:

| Value        | Meaning                                       | Range                                                                         |
| ------------ | --------------------------------------------- | ----------------------------------------------------------------------------- |
| **Sphere**   | base lens power (diopters)                    | -20 to +20, usually -6 to +6. Negative = near-sighted, positive = far-sighted |
| **Cylinder** | corrects astigmatism                          | 0 to -6, usually 0 to -3. Zero or negative only                               |
| **Axis**     | orientation of the cylinder correction        | 0 to 180, where 0 and 180 are the same. Only matters with a cylinder          |
| **Add**      | extra plus power for reading, multifocal only | +0.25 to +4, usually +0.75 to +3.50                                           |

## Sphere and cylinder trade off

Less cylinder plus half that amount added to the sphere gives almost the same correction. That's the
spherical equivalent. So a pair with less cylinder can still fit, given a sphere shift.

## One more asymmetry

Giving a far-sighted patient (positive sphere) too little power is worse than giving too much, so
[the matching algorithm](/philscore) penalizes only that direction.
