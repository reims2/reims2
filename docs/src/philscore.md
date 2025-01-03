# Glasses Matching Algorithm

This document provides an explanation of the glasses matching algorithm. The algorithm's purpose is to filter and score glasses based on a given prescription.

The corresponding [code can be found here](https://github.com/reims2/reims2/blob/main/frontend/src/lib/philscore.ts).

## Current Status

The algorithm is a replica of the one used in the previous REIMS1 system. We have comprehensive testing in place to ensure that the REIMS2 implementation aligns with the REIMS1 implementation. Any discrepancies are treated as bugs and are fixed accordingly.

We are open to refining the algorithm, see [Potential Improvements](#potential-improvements) for more information.

## Glossary

- `lens`: Refers to either OS or OD of an existing pair of glasses in the storage.
- `rx`: The desired prescription.
- `delta`: The absolute difference between a value of the desired prescription and the lens.
- `PhilScore`: Name of the resulting score. The lower the PhilScore, the better the match. A PhilScore of 0 is a perfect match. The PhilScore is usually between 0 and 3 for most searches.

## Algorithm Overview

The glasses matching process is executed in the following sequence:

Initially, we exclude glasses based on the following criteria:

1. Filter glasses by type (single- or multifocal).
2. Exclude glasses with incorrect axis using [`checkForAxisTolerance`](#checkforaxistolerance). This is performed once for OD and once for OS.
3. Exclude glasses by tolerance of sphere + cylinder using [`checkForTolerances`](#checkfortolerances). This is performed once for OD and once for OS.
4. If multifocal, exclude glasses where the lens' `additional` deviates from the desired `additional` more than tolerated. This is performed once for OD and once for OS.

> [!NOTE] Note on BAL
> If the rx has BAL enabled for an eye, we bypass steps 2 and 4 for that eye. Step 3 for that eye is executed using the sphere and cylinder of the non-BAL eye with an increased tolerance of 1.0.

After filtering, we calculate the PhilScore for the remaining glasses using the following steps:

1. Calculate the initial PhilScore for OD and OS separately using [`calcInitialDiffScore`](#calcinitialdiffscore).
2. Adjust the initial PhilScore for OD and OS separately based on the rules in [`calcSingleEyePhilscore`](#calcsingleeyephilscore).
3. Sum the OD and OS philscore to get the final PhilScore.
4. Arrange the glasses by PhilScore in ascending order.

> [!NOTE] Note on BAL
> If the rx has BAL enabled for an eye, we calculate the Philscore only for the non-BAL eye, and the resulting PhilScore for the BAL eye is always set to 0.

## Filtering Function Descriptions

### checkForTolerances

This function verifies if the sphere and cylinder of a lens are within the desired tolerance of the prescription. It compares each glass to the desired prescription sphere and cylinder, taking into account the tolerance.

It also checks against every spherical equivalent of the prescription. If the lens is within the tolerance of any spherical equivalent, it is also considered.

> [!NOTE]
> The default tolerance is 0.5. If the user specified "high tolerance" in the UI, the tolerance is increased to 1.0.

### checkForAxisTolerance

This function is invoked for every single lens. It calculates the absolute axis tolerance based on the `lens` (:exclamation: crucially, not rx :exclamation:) cylinder. A higher lens cylinder allows for less axis tolerance. It calculates the allowed range, that is, rx axis plus or minus tolerance (and accounts for wraparound at 180 degrees). It checks whether the lens axis is inside the range.

::: details Details: Axis tolerance mapping table

| Cylinder       | Axis tolerance |
| -------------- | -------------- |
| Less than -3   | 7              |
| -3 to -2.25    | 8              |
| -2             | 9              |
| -1.75 and -1.5 | 10             |
| -1.25          | 13             |
| -1             | 15             |
| -0.75          | 20             |
| -0.5           | 25             |
| -0.25          | 35             |
| 0              | 90             |

:::

#### Example for `checkForAxisTolerance`

Let's consider the following inputs:

- Available lens cylinder: -1.0
- Available lens axis: 178
- Desired prescription (rx) axis: 10

Here's how it works with these inputs:

1. Using the mapping table, we know that a cylinder of -1.0 has an axis tolerance of ±15 degrees.
2. With a desired prescription axis of 10, the initially calculated allowed range is -5 to 25 degrees.
3. However, an axis of -5 degrees doesn't exist. So, the function adjusts the allowed range to 175 to 180 degrees (for the negative part) and 0 to 25 degrees (for the positive part).
4. The function then checks if the lens axis (178 degrees) falls within this allowed range. In this case, the lens is _allowed_ because 178 is between 175 and 180.

## Scoring Function Descriptions

### calcInitialDiffScore

This function is invoked for every single lens (i.e., for each eye of every glass that hasn't been filtered before).

It calculates the initial PhilScore based on the sum of the deltas of sphere, cylinder, axis (and additional). The deltas are weighted, i.e., the sphere and cylinder deltas count a lot more than the axis and additional deltas.

| Parameter        | Weight |
| ---------------- | ------ |
| Sphere delta     | 1      |
| Cylinder delta   | 1      |
| Additional delta | 0.1    |
| Axis delta       | 1/3600 |

> [!WARNING] Notice
> This has the consequence that a high difference of axes is basically irrelevant for the score, and a difference in additionals only has a small impact. See [Potential Improvements](#potential-improvements) for more information.

The function then returns the initial PhilScore for the lens.

##### Example for `calcInitialDiffScore`

Given the following inputs:

- Desired Prescription (rx)
  | Sphere | Cylinder | Additional | Axis |
  | ------ | -------- | ---------- | ---- |
  | +2.0 | -1.0 | +1.5 | 90 |

- Available Lens

  | Sphere | Cylinder | Additional | Axis |
  | ------ | -------- | ---------- | ---- |
  | +2.5   | -0.75    | +1.25      | 85   |

The function `calcInitialDiffScore` calculates the deltas, weights them, and sums them up:

- Weighted sphere delta: |2.5 - 2.0| \* 1 = 0.5
- Weighted cylinder delta: |-0.75 - (-1.0)| \* 1 = 0.25
- Weighted additional delta: |1.25 - 1.5| \* 0.1 = 0.025
- Weighted axis delta: |85 - 90|/3600 = 0.00139

The initial PhilScore is the sum of these: 0.5 + 0.25 + 0.025 + 0.00139 = 0.77639.

> [!NOTE]
> Without the axis and additional deltas, the PhilScore would be 0.75. So it does have an impact, but it's close to negligible.

## calcSingleEyePhilscore

The score is then adjusted based on several conditions related to the sphere, cylinder, and additional values. The conditions are applied in the following order:

_Improving the score means subtracting from it so it gets smaller. Worsening it means adding to it._

1.  **Improve** the score (by 0.5) if the lens is a spherical equivalent of the prescription (_I'm actually not sure if this is what's happening, please fact check this using the code in the details section_).
    ::: details Additional details

    - This is the exact condition:

    ```ts
    if ((rxSphere - lensSphere)  === ((lensCylinder - rxCylinder) / 2) AND
     rxSphere > lensSphere AND
     cylinderDiff <= 1
    ) // NOTE: cylinder is always negative
    ```

    - _The score gets improved slightly more (by an additional amount of 0.05) if the lens sphere is bigger than 0_
      :::

2.  Only if step 2 did not apply: **Improve** the score if lens sphere is larger than desired sphere AND lens cylinder is smaller than the desired cylinder. OR the other way round (sphere smaller AND cylinder larger).
    ::: details Additional details

    - This is the exact condition:

    ```ts
      if (lensSphere > rxSphere AND rxCylinder > lensCylinder)
         OR
         (lensSphere < rxSphere AND rxCylinder < lensCylinder)
    ```

    - _The score gets improved by 0.5 if the cylinder delta is larger than 0.25, otherwise by 0.25_
    - _The score gets improved slightly more (by an additional amount of 0.05) if sphere delta matches cylinder delta_
      :::

3.  Only if step 2 or 3 did not apply: **Improve** the score (by 0.12) if the spheres are equal and the cylinder delta is small (<= 0.75).
4.  **Improve** the score by a really small amount if the search is multifocal and the lens additional is larger than the desired additional.
    ::: details Additional details
    - _Score gets improved more if the difference is larger._ Formula for how the score is improved: `-(lensAdd - rxAdd) / 100`
    - This also has basically no impact, since the maximum delta with the normal tolerance would be 0.25, so the highest score improvement would be: `-0.25/100 = -0.0025`
      :::
5.  **Worsen** the score (by 0.25) if the desired sphere is positive AND if it's larger than the lens sphere.

The function then returns the final PhilScore for the lens.

## Potential Improvements

Some ideas for potential improvements are listed below. These are not exhaustive and are open to discussion.

### For `calcInitialDiffScore`

The weights for the additional delta and axis in the initial PhilScore could be adjusted so they actually have an impact. Currently, they are basically ignored.

This would have the potential benefit that the filtering by axis could be less strict, as the axis would then have a larger impact on the score. This was a common cause for complaints of the matching process.

### For `calcSingleEyePhilscore`

1. The conditions in `calcSingleEyePhilscore` could be evaluated independently, rather than skipping some if others apply.
2. The rationale for improving the score more in condition 2 if the cylinder delta is larger is unclear.
3. The rationale for improving the score more in condition 4 if the difference is larger is unclear.

### In General

Converting the PhilScore to a percentage or a more intuitive scale could be beneficial. This would make it easier to understand the quality of the match without prior knowledge.

For example: a PhilScore of 0 could be a 100% match, and a score of 4 could be 0 %, with linear interpolation in between (so a score of 2 would be 50%). We can also do a more complex mapping than just linear, but this could be a good start.
