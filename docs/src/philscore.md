# Glasses Matching Algorithm

This document provides an explanation of the glasses matching algorithm. The algorithm's purpose is to filter and score glasses based on a given prescription.

The corresponding [code can be found here](https://github.com/reims2/reims2-frontend/blob/main/src/lib/philscore.ts).

> [!NOTE]
> The algorithm is the same as in the old REIMS1 system. We have signficant testing in place to ensure that the REIMS2 implementation matches the REIMS1 implementation. Any differences are considered bugs and should be reported.
>
> In the future we will consider to improve the algorithm, but for now we are just replicating the old system.

## Glossary

- `lens`: Refers to either OS or OD of an existing pair of glasses in the storage.
- `rx`: The desired prescription.
- `delta`: The absolute difference between a value of the desired prescription and the lens.

## Algorithm Overview

The glasses matching process is executed in the following sequence:

First, we exclude glasses based on the following criteria:

1. Filter glasses by type (single- or multifocal).
2. Exclude glasses with incorrect axis using [`checkForAxisTolerance`](#checkforaxistolerance). This is performed once for OD and once for OS.
3. Exclude glasses by tolerance of sphere + cylinder using [`checkForTolerances`](#checkfortolerances). This is performed once for OD and once for OS.
4. If multifocal, exclude glasses where the lens' `additional` deviates from the desired `additional` more than tolerated. This is performed once for OD and once for OS.

> [!NOTE]
> If the rx has BAL enabled for an eye, we bypass steps 2 and 4 for that eye and only filter the sphere and cylinder tolerance for that eye using the sphere and cylinder of the non-BAL eye. This is done using [`checkForTolerances`](#checkfortolerances) with an increased tolerance of 1.0.

After filtering, we calculate the PhilScore.

1. Calculate the initial PhilScore for OD and OS seperately using [`calcInitialDiffScore`](#calcinitialdiffscore).
2. Adjust the initial PhilScore for OD and OS seperately based on the rules in [`calcSingleEyePhilscore`](#calcsingleeyephilscore).
3. Add both OD+OS philscore to get the final PhilScore.
4. Arrange the glasses by PhilScore in ascending order.

## Filtering Function Descriptions

### checkForTolerances

This function verifies if the sphere and cylinder of a lens are within the desired tolerance of the prescription. It compares each glass to the desired prescription sphere and cylinder, taking into account the tolerance.

It also checks against every spherical equivalent of the prescription. If the lens is within the tolerance of any spherical equivalent, it is also considered.

> [!NOTE]
> The default tolerance is 0.5. If the user specified "high tolerance" in the UI, the tolerance is increased to 1.0.

### checkForAxisTolerance

This function is invoked for every single `lens`. It calculates the absolute axis tolerance based on the `lens` cylinder. A higher lens cylinder allows for less axis tolerance. It calculates the allowed range, that is, rx axis plus or minus tolerance (and accounts for wraparound at 180 degrees). It checks whether the lens axis is inside the range.

#### Example for `checkForAxisTolerance`

Let's consider the following inputs:

- Available lens cylinder: -1.0
- Available lens axis: 178
- Desired prescription (rx) axis: 10

Here's how it works with these inputs:

1. The function refers to a table that maps each cylinder value to an axis tolerance. For a cylinder of -1.0, the axis tolerance is ±15 degrees.
2. With a desired prescription axis of 10, the initially calculated allowed range is -5 to 25 degrees.
3. However, an axis of -5 degrees doesn't exist. So, the function adjusts the allowed range to 175 to 180 degrees (for the negative part) and 0 to 25 degrees (for the positive part).
4. The function then checks if the lens axis (178 degrees) falls within this allowed range. In this case, the lens is _allowed_ because 178 is between 175 and 180.

## Scoring Function Descriptions

### calcInitialDiffScore

This function is invoked for every single lens (i.e., for each eye of every glass that hasn't been filtered before).

It calculates the initial PhilScore based on the sum of the deltas of sphere, cylinder, axis (and additional). The deltas are weighted, i.e., the sphere and cylinder deltas count a lot more than the axis and additional deltas.

The weights are as follows:

- Sphere: 1
- Cylinder: 1
- Additional: 0.1
- Axis: 1/3600 (i.e., 1 degree of axis difference is 1/3600 of the score)

This means that the axis is basically irrelevant for the score, and the additional only has a small impact.

The function then returns the initial PhilScore for the lens.

### calcSingleEyePhilscore

The score is then adjusted based on several conditions related to the sphere, cylinder, and additional values. The conditions are applied in the following order:

_Improving the score means subtracting from it so it gets smaller. Worsening it means adding to it._

1. **Improve** the score (by 0.5) if the glasses matches after sphere+cylinder transformation (_spherical equivalent_)
   - _The score gets improved slightly more (by a total of 0.55) if the lens sphere is positive_
2. Only if step 2 did not apply: **Improve** the score if lens sphere is larger than desired sphere AND lens cylinder is smaller than the desired cylinder. OR the other way round (sphere smaller AND cylinder larger).
   - _The score gets improved more if sphere delta matches cylinder delta_
   - _The score also gets improved more if the cylinder delta is larger than 0.25_
   - This is the exact condition: `if (lensSphere > rxSphere AND rxCylinder > lensCylinder) OR (lensSphere < rxSphere AND rxCylinder < lensCylinder)`
3. Only if step 2 or 3 did not apply: **Improve** the score (by 0.12) if the spheres are equal and the cylinder delta is small (<= 0.75).
4. **Improve** the score if the search is multifocal and the lens additional is larger than the desired additional.
   - Score gets improved more if the difference is larger.
5. **Worsen** the score (by 0.25) if the desired sphere is positive AND if it's larger than the lens sphere.

The function then returns the final PhilScore for the lens.

## Potential Improvements

- The conditions in `calcSingleEyePhilscore` could be evaluated independently, rather than skipping some if others apply.
- The reason for improving the score more in condition 2 if the cylinder delta is larger is not clear.
- The reason for improving the score more in condition 4 if the difference is larger is not clear.
- The weights for the additional delta and axis in the initial PhilScore could be adjusted to avoid the need for separate filtering steps.
