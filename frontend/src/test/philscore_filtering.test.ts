import { GlassesSearch } from '@/model/GlassesModel'
import calculateAllPhilscore from '../lib/philscore'
import { createGlasses, createGlassesEqualOdOs, createSearchEqualLens } from './util'

// REIMS2 only: REIMS1 stored a missing add as 0, so it would match an rx add of 0
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

// REIMS2 only: REIMS1 has no BAL, its one-eye search leaves the other eye unfiltered
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

test('isBal should ignore the disabled lens cylinder if its SE is in range', () => {
  // SE +0.125 vs the other eye's +1.00, cylinder alone is 1.75 off
  const glasses = createGlasses(
    'single',
    { sphere: 1, cylinder: -1.75, axis: 110 },
    { sphere: 1, cylinder: 0, axis: 0 },
  )
  const search: GlassesSearch = {
    od: { sphere: 0, cylinder: 0, axis: 0, isBAL: true },
    os: { sphere: 1, cylinder: 0, axis: 0, isBAL: false },
    glassesType: 'single',
  }
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
})

test('isBal should filter a disabled lens with matching sphere but SE out of range', () => {
  const glasses = createGlasses(
    'single',
    { sphere: 1, cylinder: -4, axis: 110 },
    { sphere: 1, cylinder: 0, axis: 0 },
  )
  const search: GlassesSearch = {
    od: { sphere: 0, cylinder: 0, axis: 0, isBAL: true },
    os: { sphere: 1, cylinder: 0, axis: 0, isBAL: false },
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
    cylinder: -0.25,
    axis: 0,
  })
  // rx cylinder -1 would still match through a spherical equivalent, like in REIMS1
  const search = createSearchEqualLens('single', {
    sphere: 1,
    cylinder: -2,
    axis: 0,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(0)
})

test('Filter based on bigger axis diff when lens cylinder is big too', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0,
    cylinder: -1,
    axis: 30,
  })
  const search = createSearchEqualLens('single', {
    sphere: 0,
    cylinder: -1.5,
    axis: 0,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(0)
})

test('Dont filter bigger Axis diff if high tolerance', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0,
    cylinder: -1,
    axis: 30,
  })
  const search = createSearchEqualLens('single', {
    sphere: 0,
    cylinder: -1.5,
    axis: 0,
  })
  search.highTolerance = true
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
})

test('Dont filter axis diff also if there is no wraparound', () => {
  // same as above, but with smaller cylinder
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0,
    cylinder: -1,
    axis: 80,
  })
  const search = createSearchEqualLens('single', {
    sphere: 0,
    cylinder: -1,
    axis: 75,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
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

test('Filter lens with axis 0 if rx axis is far from it', () => {
  // 180 is stored as 0, so this lens is 90 degrees off
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0,
    cylinder: -1.5,
    axis: 0,
  })
  const search = createSearchEqualLens('single', {
    sphere: 0,
    cylinder: -1.5,
    axis: 90,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(0)
})

test('Dont filter lens with axis 0 if rx axis is close to it across wraparound', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0,
    cylinder: -1.5,
    axis: 0,
  })
  const search = createSearchEqualLens('single', {
    sphere: 0,
    cylinder: -1.5,
    axis: 175,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
})

// REIMS2 only: REIMS1 compared the lens axis to the meaningless axis 0 of a zero-cylinder rx
test('Dont filter by axis if rx cylinder is 0', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0.75,
    cylinder: -0.5,
    axis: 90,
  })
  const search = createSearchEqualLens('single', {
    sphere: 0.75,
    cylinder: 0,
    axis: 0,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(1)
})

test('Filter too much lens cylinder if rx cylinder is 0', () => {
  const glasses = createGlassesEqualOdOs('single', {
    sphere: 0.75,
    cylinder: -0.75,
    axis: 90,
  })
  const search = createSearchEqualLens('single', {
    sphere: 0.75,
    cylinder: 0,
    axis: 0,
  })
  const result = calculateAllPhilscore(search, glasses)
  expect(result).toHaveLength(0)
})

// [lens cylinder, axis tolerance in degrees], from REIMS1 ATOL.prg
test.each([
  [-0.25, 35],
  [-0.5, 25],
  [-0.75, 20],
  [-1, 15],
  [-1.25, 13],
  [-1.5, 10],
  [-1.75, 10],
  [-2, 9],
  [-2.25, 9],
  [-2.5, 8],
  [-2.75, 8],
  [-3, 8],
  [-3.25, 8],
  [-3.5, 8],
  [-3.75, 8],
  [-4, 7],
  [-4.5, 7],
])('REIMS1: lens cylinder %s allows an axis difference of %s', (cylinder, tolerance) => {
  const search = createSearchEqualLens('single', { sphere: 0, cylinder, axis: 90 })
  const atTolerance = createGlassesEqualOdOs('single', {
    sphere: 0,
    cylinder,
    axis: 90 + tolerance,
  })
  const beyondTolerance = createGlassesEqualOdOs('single', {
    sphere: 0,
    cylinder,
    axis: 90 + tolerance + 1,
  })
  expect(calculateAllPhilscore(search, atTolerance)).toHaveLength(1)
  expect(calculateAllPhilscore(search, beyondTolerance)).toHaveLength(0)
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
