import { GlassesSearch } from '@/model/GlassesModel'
import calculateAllPhilscore from '../lib/philscore'
import { createGlasses, createGlassesEqualOdOs, createSearchEqualLens } from './util'

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
