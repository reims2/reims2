# Glasses Matching Algorithm

This document provides a comprehensive explanation of the glasses matching algorithm implemented in the `philscore.ts` file. The algorithm is designed to filter and score glasses based on a given prescription.

## Glossary

- `lens`: Refers to either OS or OD of an existing pair of glasses in the storage.
- `rx`: The desired prescription.
- `delta`: The absolute difference between a value of the desired prescription and the lens.

## Algorithm Overview

The glasses matching process follows these steps:

1. Filter glasses by type (single- or multifocal).
2. Filter out glasses with incorrect axis using [`checkForAxisTolerance`](#checkforaxistolerance). Executed once for OD and once for OS.
3. Filter out glasses by tolerance of sphere + cylinder using [`checkForTolerances`](#checkfortolerances). Executed once for OD and once for OS.
4. If multifocal, filter out glasses where the lens' `additional` deviates from the desired `additional` by more than the set tolerance. Executed once for OD and once for OS.
5. Calculate OD PhilScore using [`calcSingleEyePhilscore`](#calcsingleeyephilscore).
6. Calculate OS Philscore using [`calcSingleEyePhilscore`](#calcsingleeyephilscore).
7. Sum OD+OS philscore as the final PhilScore.
8. Sort the glasses by PhilScore.

> [!NOTE]
> If the rx has BAL enabled for an eye, we ignore steps 2 and 4 for that eye and only filter the sphere and cylinder tolerance for that eye using the sphere and cylinder of the non-BAL eye. Using [`checkForTolerances`](#checkfortolerances).

## Function Descriptions

### checkForTolerances

This function checks if the sphere and cylinder of a lens are within the desired tolerance of the prescription. It compares each glass to the desired prescription sphere and cylinder, accounting for the tolerance.

It also checks against every spherical equivalent of the prescription. If the lens is within the tolerance of any spherical equivalent, it is also considered.

> [!NOTE]
> The default tolerance is 0.5. If the user specified "high tolerance" in the UI, the tolerance is increased to 1.0. If the input is a lens of a eye with BAL enabled, the tolerance is also increased to 1.0.

### checkForAxisTolerance

This function is called for every single `lens`. It determines the absolute axis tolerance based on the `lens` cylinder. A higher lens cylinder allows for less axis tolerance. It calculates the allowed range, that means rx axis plus minus tolerance (and account for wraparound at 180 degree). It checks whether the lens axis is inside the range.

### calcSingleEyePhilscore

This function is called for every single lens (i.e., for each eye of every glass that hasn't been filtered before). It calculates the initial PhilScore based on the sum of the deltas of sphere, cylinder, axis (and additional). The deltas are weighted, i.e., the sphere and cylinder deltas count a lot more than the axis and additional deltas.

The score is then adjusted based on several conditions related to the sphere, cylinder, and additional values. The conditions are applied in the following order:

_Improving the score means subtracting from it so it gets smaller. Worsening it means adding to it._

1. **Improve** the score (by 0.5) if the glasses matches after sphere+cylinder transformation (_spherical equivalent_)
   - _The score get's improved slightly more (by a total of 0.55) if the lens sphere is positive_
2. Only if step 2 did not apply: **Improve** the score if lens sphere is bigger than desired sphere AND lens cylinder is smaller than the desired cylinder. OR the other way round (sphere smaller AND cylinder bigger).
   - _The score get's improved more if sphere delta matches cylinder delta_
   - _The score also get's improved more if the cylinder delta is bigger than 0.25_
   - This is the exact condition: `if (lensSphere > rxSphere AND rxCylinder > lensCylinder) OR (lensSphere < rxSphere AND rxCylinder < lensCylinder)`
3. Only if step 2 or 3 did not apply: **Improve** the score (by 0.12) if the spheres are equal and the cylinder delta is small (<= 0.75).
4. **Improve** the score if the search is multifocal and the lens additional is bigger than the desired additional.
   - Score gets improved more if the difference is bigger.
5. **Worsen** the score (by 0.25) if the desired sphere is positive AND if it's bigger than the lens sphere.

The function then returns the final PhilScore for the lens.

## Potential Improvements

- The conditions in `calcSingleEyePhilscore` could be evaluated independently, rather than skipping some if others apply.
- It's unclear why the score is improved more in condition 2 if the cylinder delta is bigger.
- It's unclear why the score is improved more in condition 4 if the difference is bigger.
- The weights for the additional delta and axis in the initial PhilScore could be adjusted to avoid the need for separate filtering steps.
