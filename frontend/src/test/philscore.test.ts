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

test('isBal on OS should ignore values of OS search terms', () => {
  const glasses = createGlassesEqualOdOs('multifocal', {
    sphere: 1,
    cylinder: -1,
    axis: 0,
    add: 1,
  })
  const search: GlassesSearch = {
    od: { sphere: 1, cylinder: -1, axis: 0, add: 1, isBAL: false },
    os: { sphere: 10, cylinder: 10, axis: 100, add: 100, isBAL: true },
    glassesType: 'multifocal',
  }
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
})

test('Dont filter if spherical equivalent would be in range', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: -1.25,
    cylinder: -0.25,
    axis: 0,
  })
  const search = createSearchEqualLens('single', {
    sphere: -1,
    cylinder: -1.5,
    axis: 0,
  })
  // spherical equivalant of search is sphere: -1.75 and cylinder: 0, which must be in tolerance of glasses
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
})

test('Dont filter if spherical equivalent changes the sign of sphere', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: -0.75,
    cylinder: 0,
    axis: 0,
  })
  const search = createSearchEqualLens('single', {
    sphere: 0,
    cylinder: -1.5,
    axis: 0,
  })
  // spherical equivalant of search is sphere: -1.75 and cylinder: 0, which must be in tolerance of glasses
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
})

test('isBal on OD should ignore values of OD search terms', () => {
  const glasses = createGlassesEqualOdOs('multifocal', {
    sphere: 1,
    cylinder: -1,
    axis: 0,
    add: 1,
  })
  const search: GlassesSearch = {
    od: { sphere: 10, cylinder: 10, axis: 100, add: 100, isBAL: true },
    os: { sphere: 1, cylinder: -1, axis: 0, add: 1, isBAL: false },
    glassesType: 'multifocal',
  }
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
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

test('Filter if sphere much bigger', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 1.75,
    cylinder: 0,
    axis: 0,
  })
  const search = createSearchEqualLens('single', {
    sphere: 1,
    cylinder: 0,
    axis: 0,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(0)
})

test('Dont filter if sphere is bigger and high tolerance', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 1.75,
    cylinder: 0,
    axis: 0,
  })
  const search = createSearchEqualLens('single', {
    sphere: 1,
    cylinder: 0,
    axis: 0,
  })
  search.highTolerance = true
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
})

test('Filter if sphere much smaller', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0.25,
    cylinder: 0,
    axis: 0,
  })
  const search = createSearchEqualLens('single', {
    sphere: 1,
    cylinder: 0,
    axis: 0,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(0)
})

test('Filter bigger cyl', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 1,
    cylinder: 0.75,
    axis: 0,
  })
  const search = createSearchEqualLens('single', {
    sphere: 1,
    cylinder: 0,
    axis: 0,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(0)
})

test('Filter smaller cyl', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 1,
    cylinder: 0.25,
    axis: 0,
  })
  const search = createSearchEqualLens('single', {
    sphere: 1,
    cylinder: 1,
    axis: 0,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(0)
})

test('Filter based on bigger axis diff when lens cylinder is big too', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0,
    cylinder: -3,
    axis: 30,
  })
  const search = createSearchEqualLens('single', {
    sphere: 0,
    cylinder: -3.5,
    axis: 0,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(0)
})

test('Dont filter bigger axis diff if (lens) cylinder is small', () => {
  // same as above, but with smaller cylinder
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0,
    cylinder: -0.25,
    axis: 30,
  })
  const search = createSearchEqualLens('single', {
    sphere: 0,
    cylinder: -0.5,
    axis: 0,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
})

test('Dont filter bigger axis diff if (lens) cylinder is small, even with wraparound', () => {
  // same as above, but with smaller cylinder
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0,
    cylinder: -0.25,
    axis: 10,
  })
  const search = createSearchEqualLens('single', {
    sphere: 0,
    cylinder: -0.5,
    axis: 170,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
})

test('Dont filter bigger axis diff if (lens) cylinder is small, even with backward wraparound', () => {
  // same as above, but with smaller cylinder
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0,
    cylinder: -0.25,
    axis: 170,
  })
  const search = createSearchEqualLens('single', {
    sphere: 0,
    cylinder: -0.5,
    axis: 10,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
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
