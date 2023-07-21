import {
  equalSphereAndSmallCylinderScore,
  smallerLensSphereScore,
  sphericalEquivalentScore,
  contraryDiffsScore,
} from '../lib/philscore'
import { test, expect } from 'vitest'

/** equalSphereAndSmallCylinderScore tests */

test('equal sphere and small cylinder diff returns negative score', () => {
  expect(equalSphereAndSmallCylinderScore(1, 1, 0.1)).toBeLessThan(0)
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
  expect(smallerLensSphereScore(1, 0)).toBeGreaterThan(0)
})

test('smaller lens sphere (that is negative) than desired sphere returns positive score', () => {
  expect(smallerLensSphereScore(1, -1)).toBeGreaterThan(0)
})

test('smaller lens sphere than desired sphere (that is 0) returns no score', () => {
  expect(smallerLensSphereScore(0, -1)).toBe(0)
})

test('smaller lens sphere than desired sphere (that is negative) returns no score', () => {
  expect(smallerLensSphereScore(-0.25, -1)).toBe(0)
})

/** sphericalEquivalentScore tests */

test('spherical equivalent of rx returns negative score', () => {
  expect(sphericalEquivalentScore(-1, -1.25, -0.5, 0)).toBeLessThan(0)
})

test('spherical equivalent of lens (other way round) should not return score', () => {
  expect(sphericalEquivalentScore(-1.25, -1, 0, -0.5)).toBe(0)
})

test('spherical equivalent for multifocals also returns negative score', () => {
  expect(sphericalEquivalentScore(-1, -1.25, -0.5, 0)).toBeLessThan(0)
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
  expect(contraryDiffsScore(1, 1.5, 1, 0.75)).toBeLessThan(0)
})

test('too small sphere and too big cylinder returns negative score', () => {
  expect(contraryDiffsScore(1, 0.5, 1, 1.75)).toBeLessThan(0)
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
