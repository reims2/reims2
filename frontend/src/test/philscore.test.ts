import { Eye, Glasses, GlassesSearch, GlassesType } from '@/model/GlassesModel'
import calculateAllPhilscore from '../lib/philscore'

function createGlassesEqualOdOs(glassesType: GlassesType, eye: Eye): Glasses[] {
  return createGlasses(glassesType, eye, eye)
}

function createGlasses(glassesType: GlassesType, od: Eye, os: Eye): Glasses[] {
  return [
    {
      appearance: 'neutral',
      glassesType,
      glassesSize: 'medium',
      od,
      os,
      id: 1,
      sku: 1,
      location: 'sa',
      creationDate: 0,
    },
  ]
}

function createSearchOdOnly(glassesType: GlassesType, od: Eye): GlassesSearch {
  return {
    ...createSearchEqualLens(glassesType, od),
    os: {
      isBAL: true,
      sphere: 0,
      cylinder: 0,
      axis: 0,
    },
  }
}

function createSearchEqualLens(glassesType: GlassesType, eye: Eye): GlassesSearch {
  return {
    glassesType,
    od: {
      ...eye,
      isBAL: false,
    },
    os: {
      ...eye,
      isBAL: false,
    },
    highTolerance: false,
  }
}

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

test('Multifocals with no Additional should be ignored', () => {
  const glasses = createGlassesEqualOdOs('multifocal', {
    sphere: 0.25,
    cylinder: 0,
    axis: 0,
    add: undefined,
  })
  const search = createSearchEqualLens('multifocal', {
    sphere: 0.25,
    cylinder: 0,
    axis: 0,
    add: 0,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(0)
})

test('isBal should filter glasses with disabled lens sphere out of range', () => {
  const glasses = createGlasses(
    'single',
    {
      sphere: 0.25,
      cylinder: -0.5,
      axis: 0,
    },
    {
      sphere: 1.5,
      cylinder: -0.5,
      axis: 0,
    },
  )
  const search: GlassesSearch = {
    od: { sphere: 0.25, cylinder: -0.5, axis: 0, isBAL: false },
    os: { sphere: 0, cylinder: 0, axis: 0, isBAL: true },
    glassesType: 'single',
  }
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(0)
})

/** Following test input and result philscore was exported from REIMS1,
 * so be careful when changing the test.
 */

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

test('REIMS1: contraryDiffsScore applied with small cylinder diff', () => {
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
