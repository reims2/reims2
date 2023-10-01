import { Eye, Glasses, GlassesSearch, GlassesType } from '@/model/GlassesModel'
import calculateAllPhilscore from '../lib/philscore'
import { test, expect } from 'vitest'

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
    glassesType,
    od: {
      ...od,
      isBAL: false,
    },
    os: {
      isBAL: true,
      sphere: 0,
      cylinder: 0,
      axis: 0,
    },
    highTolerance: false,
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

test('Spherical equivalent score applied', () => {
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

test('contraryDiffsScore applied', () => {
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

test('equalSphereAndSmallCylinderScore applied', () => {
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
