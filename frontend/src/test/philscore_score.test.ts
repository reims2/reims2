import calculateAllPhilscore from '../lib/philscore'
import { createGlassesEqualOdOs, createSearchEqualLens, createSearchOdOnly } from './util'

/** All tests prefixed with REIMS1 have their test input and result philscore
 * directly from REIMS1, so be careful when changing those.
 */

test('Equal glasses and search returns philscore 0', () => {
  const glasses = createGlassesEqualOdOs('multifocal', {
    sphere: 0.25,
    cylinder: -0.25,
    axis: 5,
    add: 1,
  })
  const search = createSearchEqualLens('multifocal', {
    sphere: 0.25,
    cylinder: -0.25,
    axis: 5,
    add: 1,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
  expect(result[0].score).toBe(0)
})

test('sphericalEquivalentScore applied', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: -0.25,
    cylinder: 0,
    axis: 180,
  })
  const search = createSearchOdOnly('single', {
    sphere: 0.25,
    cylinder: -1,
    axis: 180,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
  expect(result[0].score).toBeCloseTo(1.25, 3)
})

test('REIMS1: sphericalEquivalentScore applied combined with smallerLensSphereScore. Also sphericalEquivalentScore as well as contraryDiffsScore could apply.', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0.25,
    cylinder: -0.5,
    axis: 180,
  })
  const search = createSearchOdOnly('single', {
    sphere: 0.5,
    cylinder: -1,
    axis: 180,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
  expect(result[0].score).toBeCloseTo(0.45, 3)
})

test('REIMS1: contraryDiffsScore applied with big cylinder diff', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0.5,
    cylinder: -1,
    axis: 180,
  })
  const search = createSearchOdOnly('single', {
    sphere: 0.25,
    cylinder: -0.5,
    axis: 180,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
  expect(result[0].score).toBeCloseTo(0.25, 3)
})

test('contraryDiffsScore applied with big cylinder diff and equal diffs', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0.5,
    cylinder: -1,
    axis: 180,
  })
  const search = createSearchOdOnly('single', {
    sphere: 0,
    cylinder: -0.5,
    axis: 180,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
  expect(result[0].score).toBeCloseTo(0.45, 3)
})

test('contraryDiffsScore applied with small cylinder diff', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0.25,
    cylinder: -0.5,
    axis: 180,
  })
  const search = createSearchOdOnly('single', {
    sphere: 0.75,
    cylinder: -0.75,
    axis: 180,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
  expect(result[0].score).toBeCloseTo(0.75, 3)
})

test('REIMS1: contraryDiffsScore applied with small cylinder diff and equal diffs', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0.5,
    cylinder: -0.75,
    axis: 180,
  })
  const search = createSearchOdOnly('single', {
    sphere: 0.25,
    cylinder: -0.5,
    axis: 180,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
  expect(result[0].score).toBeCloseTo(0.2, 3)
})

test('REIMS1: equalSphereAndSmallCylinderScore applied', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0.25,
    cylinder: -0.25,
    axis: 0,
  })
  const search = createSearchOdOnly('single', {
    sphere: 0.25,
    cylinder: -0.5,
    axis: 180,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
  expect(result[0].score).toBeCloseTo(0.13, 3)
})

test('REIMS1: multiFocalAddScore applied', () => {
  const glasses = createGlassesEqualOdOs('multifocal', {
    sphere: 0.5,
    cylinder: -0.5,
    axis: 0,
    add: 1,
  })
  const search = createSearchOdOnly('multifocal', {
    sphere: 0.5,
    cylinder: -0.5,
    axis: 0,
    add: 0.5,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
  expect(result[0].score).toBeCloseTo(0.045, 3)
})

test('REIMS1: multiFocalAddScore applied combined with equalSphereAndSmallCylinderScore', () => {
  const glasses = createGlassesEqualOdOs('multifocal', {
    sphere: 0.25,
    cylinder: -0.25,
    axis: 0,
    add: 1,
  })
  const search = createSearchOdOnly('multifocal', {
    sphere: 0.25,
    cylinder: -0.5,
    axis: 0,
    add: 0.5,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
  expect(result[0].score).toBeCloseTo(0.175, 3)
})
