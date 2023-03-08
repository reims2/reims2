# How the matching works

This page describes how the matching currently works. It starts with a high level overview of the process and then describes each part in more detail.

The corresponding [code can be found here](https://github.com/reims2/reims2-frontend/blob/main/lib/philscore.ts).

**Glossary**

- `lens` refers to either OS or OD of an existing glass (from the storage)
- `rx` is the desired prescription
- `delta` means the **absolute** difference between a value of the desired rx and the lens

## High-level overview

1. Filter glasses by type (either single or multifocal)
2. Filter out glasses with wrong OD or OS axis ([`checkForAxisTolerance`](#checkforaxistolerance))
3. Filter out glasses by tolerance of sphere + cylinder ([`checkForTolerances`](#checkForTolerances))
4. If multifocal: Filter out glasses which lens' `additional` is more than TOLERANCE different to the desired `additional`.
5. Calculate OD PhilScore ([`calcSingleEyePhilscore`](#calcsingleeyephilscore))
6. Calculate OS Philscore ([`calcSingleEyePhilscore`](#calcsingleeyephilscore))
7. Sum OD+OS philscore
8. Remove any glasses with a PhilScore greater than 4
9. Done, you now have a list of glasses that match

## checkForTolerances

The Sphere and Cylinder of that glasses must be within the desired tolerance of the prescription (currently set to 0.5 by default).

Each glass is compared to the desired prescription sphere +- tolerance and prescription cylinder +- tolerance and discarded it's outside that range. It's not only checked against the desired prescription +- tolerance, but also against (every spherical equivalent of that prescription) +- tolerance.

Example to follow TODO

## checkForAxisTolerance

This function is called for every single lens (i.e. for each eye of every glass).

1. Determine the absolute axis tolerance based on the `lens` cylinder. A higher lens cylinder allows for less axis tolerance.
2. Calculate the allowed range, that means rx axis plus minus tolerance (and account for wraparound at 180 degree).
3. Check whether the lens axis is inside the range.

### Example

Following input:

- available lens cylinder is -1.0
- available lens axis is 178
- desired rx axis is 10

1. There's a simple table on which cylinder means which tolerance. Here, for cylinder -1.0 the axis tolerance is +-15.
2. With the desired rx axis of 10, the allowed range is -5 to 25.
3. -5 doesn't exist, so the allowed range is actually 175 to 180 and 0 to 25.
4. This lens is _allowed_ because 178 is between 175 and 180.

## calcSingleEyePhilscore

This function is called for every single lens (i.e. for each eye of every glass that hasn't been filtered before).

_Improving the score means subtracting from it so it gets smaller. Worsening it means adding to it._

1. Calculate the _initial_ PhilScore based on the sum of the deltas of sphere, cylinder, axis (and additional).
   - The deltas are weighted, i.e. the sphere and cylinder deltas count a lot more than the axis and additional deltas.
2. **Improve** the score if the glasses matches after sphere+cylinder transformation (_spherical equivalent_)
   - _The score get's improved slightly more if lens sphere is positive_
3. Only if step 2 did not apply: **Improve** the score if lens sphere is bigger than desired sphere AND lens cylinder is smaller than the desired cylinder. OR the other way round (sphere smaller AND cylinder bigger).
   - _The score get's improved more if sphere delta matches cylinder delta_
   - `if (lens.sphere > rx.sphere AND lens.cylinder < rx.cylinder) OR (lens.sphere < rx.sphere AND lens.cylinder > rx.cylinder)`
4. Only if step 2 or 3 did not apply: **Improve** the score if the spheres are equal and the cylinder delta is small (<= 0.75).
5. **Improve** the score if the search is multifocal and the lens additional is bigger than the desired additional.
   - Score gets improved more if the difference is bigger. (Why?)
6. **Worsen** the score if the desired sphere is positive AND if it's bigger than the lens sphere.

## Things that could be improved or make no sense

- Not sure why steps 3 and 4 are only applied when previous steps did not apply. Maybe change that?
- Use a better (=> higher) weight for the additional delta in the initial Philscore. That way we can avoid the filtering by additional.
- Use a better weight (maybe even nonlinear based on lens cylinder) for the axis, so we can avoid the filtering by axis.

## Further reading

- Here is an [analysis of the previous philscore algorithm](./analysis#philscore). We don't use the exact algorithm anymore because it was possible to simplify a lot of things nowadays due to more computing power available. The output should stay the same though.
