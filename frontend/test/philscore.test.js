const philscore = require('../lib/philscore')

/** equalSphereAndSmallCylinderScore tests */

test('equal sphere and small cylinder diff returns negative score', () => {
  expect(philscore.equalSphereAndSmallCylinderScore(1, 1, 0.1)).toBeNegative()
})

test('unequal sphere and small cylinder diff returns no score', () => {
  expect(philscore.equalSphereAndSmallCylinderScore(1, 0, 0.1)).toBe(0)
})

test('equal sphere and big cylinder diff returns no score', () => {
  expect(philscore.equalSphereAndSmallCylinderScore(1, 1, 1)).toBe(0)
})

test('equal sphere and no cylinder diff returns no score', () => {
  expect(philscore.equalSphereAndSmallCylinderScore(1, 1, 0)).toBe(0)
})

/** smallerLensSphereScore tests */

test('smaller lens sphere than desired sphere returns positive score', () => {
  expect(philscore.smallerLensSphereScore(1, 0)).toBePositive()
})

test('smaller lens sphere (that is negative) than desired sphere returns positive score', () => {
  expect(philscore.smallerLensSphereScore(1, -1)).toBePositive()
})

test('smaller lens sphere than desired sphere (that is 0) returns no score', () => {
  expect(philscore.smallerLensSphereScore(0, -1)).toBe(0)
})

test('smaller lens sphere than desired sphere (that is negative) returns no score', () => {
  expect(philscore.smallerLensSphereScore(-0.25, -1)).toBe(0)
})

/** sphericalEquivalentScore tests */

test('spherical equivalent of rx returns negative score', () => {
  expect(philscore.sphericalEquivalentScore(-1, -1.25, -0.5, 0, true)).toBeNegative()
})

test('spherical equivalent of lens (other way round) also returns negative score', () => {
  // fixme should it?
  expect(philscore.sphericalEquivalentScore(-1.25, -1, 0, -0.5, true)).toBeNegative()
})

test('spherical equivalent for multifocals returns no score', () => {
  expect(philscore.sphericalEquivalentScore(-1, -1.25, -0.5, 0, false)).toBe(0)
})

test('spherical equivalent with positive spheres returns bigger score than the one with negative spheres', () => {
  const scoreNegativeEquivalent = philscore.sphericalEquivalentScore(-1, -1.25, -0.5, 0, true)
  const scorePositiveEquivalent = philscore.sphericalEquivalentScore(1, 1.25, 0.5, 0, true)
  expect(Math.abs(scorePositiveEquivalent) > Math.abs(scoreNegativeEquivalent)).toBeTrue()
})

test('spherical equivalent for too big cylinders returns no score', () => {
  expect(philscore.sphericalEquivalentScore(-1, -1.75, -1.5, 0, true)).toBe(0)
})

/** bothSmallerOrBiggerScore tests */

test('too big sphere and too small cylinder returns negative score', () => {
  expect(philscore.contraryDiffsScore(1, 1.5, 1, 0.75)).toBeNegative()
})

test('too small sphere and too big cylinder returns negative score', () => {
  expect(philscore.contraryDiffsScore(1, 0.5, 1, 1.75)).toBeNegative()
})

test('too small sphere and fitting cylinder returns no score', () => {
  expect(philscore.contraryDiffsScore(1, 0.5, 1, 1)).toBe(0)
})

test('fitting sphere and too small cylinder returns no score', () => {
  expect(philscore.contraryDiffsScore(1, 1, 1, 0.75)).toBe(0)
})

test('heigher cylinder difference should returns bigger score', () => {
  const smallCylinderDiffScore = philscore.contraryDiffsScore(1, 1.5, 1, 0.75)
  const bigCylinderDiffScore = philscore.contraryDiffsScore(1, 1.5, 1, 0)
  expect(Math.abs(bigCylinderDiffScore) > Math.abs(smallCylinderDiffScore)).toBeTrue()
})
