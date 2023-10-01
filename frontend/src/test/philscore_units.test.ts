import {
  equalSphereAndSmallCylinderScore,
  smallerLensSphereScore,
  sphericalEquivalentScore,
  contraryDiffsScore,
  multiFocalAddScore,
  calcSphericalEquivalents,
} from '../lib/philscore'
import { test, expect } from 'vitest'

/** equalSphereAndSmallCylinderScore tests */

test('equal sphere and small cylinder diff returns negative score', () => {
  expect(equalSphereAndSmallCylinderScore(1, 1, 0.1)).toBe(-0.12)
})

test('unequal sphere and small cylinder diff returns no score', () => {
  expect(equalSphereAndSmallCylinderScore(1, 0, 0.1)).toBe(0)
})

test('equal sphere and big cylinder diff returns no score', () => {
  expect(equalSphereAndSmallCylinderScore(1, 1, 1)).toBe(0)
})

test('equal sphere and no cylinder diff returns no score', () => {
  expect(equalSphereAndSmallCylinderScore(1, 1, 0)).toBe(0)
})

/** smallerLensSphereScore tests */

test('smaller lens sphere than desired sphere returns positive score', () => {
  expect(smallerLensSphereScore(1, 0)).toBe(0.25)
})

test('smaller lens sphere (that is negative) than desired sphere returns positive score', () => {
  expect(smallerLensSphereScore(1, -1)).toBe(0.25)
})

test('smaller lens sphere than desired sphere (that is 0) returns no score', () => {
  expect(smallerLensSphereScore(0, -1)).toBe(0)
})

test('smaller lens sphere than desired sphere (that is negative) returns no score', () => {
  expect(smallerLensSphereScore(-0.25, -1)).toBe(0)
})

/** sphericalEquivalentScore tests */

test('spherical equivalent of rx returns negative score', () => {
  expect(sphericalEquivalentScore(-1, -1.25, -0.5, 0)).toBe(-0.5)
})

test('spherical equivalent of lens (other way round) should not return score', () => {
  expect(sphericalEquivalentScore(-1.25, -1, 0, -0.5)).toBe(0)
})

test('spherical equivalent for multifocals also returns negative score', () => {
  expect(sphericalEquivalentScore(-1, -1.25, -0.5, 0)).toBe(-0.5)
})

test('spherical equivalent with positive spheres returns bigger score than the one with negative spheres', () => {
  const scoreNegativeEquivalent = sphericalEquivalentScore(-1, -1.25, -0.5, 0)
  const scorePositiveEquivalent = sphericalEquivalentScore(1.25, 1, -0.5, 0)
  expect(Math.abs(scorePositiveEquivalent) > Math.abs(scoreNegativeEquivalent)).toBeTruthy()
})

test('spherical equivalent for too big cylinders returns no score', () => {
  expect(sphericalEquivalentScore(-1, -1.75, -1.5, 0)).toBe(0)
})

/** bothSmallerOrBiggerScore tests */

test('too big sphere and too small cylinder returns negative score', () => {
  expect(contraryDiffsScore(1, 1.5, 1, 0.75)).toBe(-0.25)
})

test('too small sphere and too big cylinder returns negative score', () => {
  expect(contraryDiffsScore(1, 0.5, 1, 1.75)).toBe(-0.5)
})

test('too small sphere and fitting cylinder returns no score', () => {
  expect(contraryDiffsScore(1, 0.5, 1, 1)).toBe(0)
})

test('fitting sphere and too small cylinder returns no score', () => {
  expect(contraryDiffsScore(1, 1, 1, 0.75)).toBe(0)
})

test('heigher cylinder difference should returns bigger score', () => {
  const smallCylinderDiffScore = contraryDiffsScore(1, 1.5, 1, 0.75)
  const bigCylinderDiffScore = contraryDiffsScore(1, 1.5, 1, 0)
  expect(Math.abs(bigCylinderDiffScore) > Math.abs(smallCylinderDiffScore)).toBeTruthy()
})

test('bigger rx Add than lens Add returns no score', () => {
  expect(multiFocalAddScore(2, 1)).toBe(0)
})

test('bigger lens Add than rx Add returns negative score', () => {
  expect(multiFocalAddScore(1, 2)).toBe(-0.01)
})

test('Spherical equivs should also work for sphere values that now got negative', () => {
  const result = calcSphericalEquivalents(0.25, -1)
  const expected = [
    {
      cylinder: -1,
      sphere: 0.25,
    },
    {
      cylinder: -0.5,
      sphere: 0.0,
    },
    {
      cylinder: 0.0,
      sphere: -0.25,
    },
  ]
  expect(result.sort()).toEqual(expected.sort())
})

test('Should only return input as spherical equiv for small cylinder vals', () => {
  const result = calcSphericalEquivalents(0.25, -0.25)
  const expected = [
    {
      cylinder: -0.25,
      sphere: 0.25,
    },
  ]
  expect(result.sort()).toEqual(expected.sort())
})
