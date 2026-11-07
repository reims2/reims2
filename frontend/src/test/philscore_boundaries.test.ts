import { Eye, GlassesType } from '@/model/GlassesModel'
import calculateAllPhilscore from '../lib/philscore'
import { createGlassesEqualOdOs, createSearchEqualLens, createSearchOdOnly } from './util'

// every tolerance edge is inclusive, found by mutation testing (pnpm test:mutation)
// and checked against REIMS1 with the oracle in reims1-decompiled/oracle
function matches(rx: Eye, lens: Eye, glassesType: GlassesType = 'single', highTolerance?: boolean) {
  const search = { ...createSearchEqualLens(glassesType, rx), highTolerance }
  return calculateAllPhilscore(search, createGlassesEqualOdOs(glassesType, lens)).length === 1
}

const lensAxis = (axis: number): Eye => ({ sphere: 0, cylinder: -1, axis })

describe('axis tolerance edges', () => {
  // a lens cylinder of -1 allows 15 degrees
  test('without wraparound', () => {
    const rx = { sphere: 0, cylinder: -1, axis: 90 }
    expect([74, 75, 105, 106].map((axis) => matches(rx, lensAxis(axis)))).toEqual([
      false,
      true,
      true,
      false,
    ])
  })

  test('range starting exactly at 0', () => {
    const rx = { sphere: 0, cylinder: -1, axis: 15 }
    expect(matches(rx, lensAxis(0))).toBe(true)
    expect(matches(rx, lensAxis(100))).toBe(false)
  })

  test('range ending exactly at 180', () => {
    const rx = { sphere: 0, cylinder: -1, axis: 165 }
    expect(matches(rx, lensAxis(180))).toBe(true)
    expect(matches(rx, lensAxis(60))).toBe(false)
  })

  test('with wraparound', () => {
    const rx = { sphere: 0, cylinder: -1, axis: 5 }
    expect([169, 170, 0, 20, 21].map((axis) => matches(rx, lensAxis(axis)))).toEqual([
      false,
      true,
      true,
      true,
      false,
    ])
  })

  test('high tolerance doubles it', () => {
    const rx = { sphere: 0, cylinder: -1, axis: 90 }
    expect([59, 60, 120, 121].map((axis) => matches(rx, lensAxis(axis), 'single', true))).toEqual([
      false,
      true,
      true,
      false,
    ])
  })

  test('a lens cylinder of -4 allows 7 degrees', () => {
    const rx = { sphere: 0, cylinder: -4, axis: 90 }
    expect(matches(rx, { sphere: 0, cylinder: -4, axis: 83 })).toBe(true)
    expect(matches(rx, { sphere: 0, cylinder: -4, axis: 82 })).toBe(false)
  })
})

describe('sphere and cylinder tolerance edges', () => {
  test('normal tolerance when the search leaves it out', () => {
    const rx = { sphere: 1, cylinder: 0, axis: 0 }
    const lens = { sphere: 1.75, cylinder: 0, axis: 0 }
    expect(matches(rx, lens)).toBe(false)
    expect(matches(rx, lens, 'single', true)).toBe(true)
  })

  test('spherical equivalents start at a cylinder of exactly -0.5 and -1', () => {
    expect(
      matches({ sphere: 1, cylinder: -0.5, axis: 90 }, { sphere: 0.25, cylinder: 0, axis: 0 }),
    ).toBe(true)
    expect(
      matches({ sphere: 1, cylinder: -1, axis: 90 }, { sphere: 0, cylinder: 0, axis: 0 }),
    ).toBe(true)
  })

  test('the third spherical equivalent is 0.75 lower in sphere', () => {
    const rx = { sphere: 1, cylinder: -2, axis: 90 }
    expect(matches(rx, { sphere: -0.25, cylinder: 0, axis: 0 })).toBe(true)
    expect(matches(rx, { sphere: -0.5, cylinder: 0, axis: 0 })).toBe(false)
  })
})

describe('add tolerance edges', () => {
  const rx = { sphere: 0, cylinder: 0, axis: 0, add: 2 }
  const lens = (add: number) => ({ sphere: 0, cylinder: 0, axis: 0, add })

  test('normal tolerance', () => {
    expect(matches(rx, lens(2.5), 'multifocal')).toBe(true)
    expect(matches(rx, lens(2.75), 'multifocal')).toBe(false)
  })

  test('high tolerance', () => {
    expect(matches(rx, lens(3), 'multifocal', true)).toBe(true)
    expect(matches(rx, lens(3.25), 'multifocal', true)).toBe(false)
  })
})

describe('score rule edges', () => {
  function odScore(rx: Eye, lens: Eye, highTolerance = false) {
    const search = { ...createSearchOdOnly('single', rx), highTolerance }
    const [result] = calculateAllPhilscore(search, createGlassesEqualOdOs('single', lens))
    return result.odScore
  }

  test('a smaller lens sphere only costs extra for a positive rx sphere', () => {
    expect(
      odScore({ sphere: 0, cylinder: 0, axis: 0 }, { sphere: -0.25, cylinder: 0, axis: 0 }),
    ).toBeCloseTo(0.25, 5)
  })

  test('equal spheres get the small cylinder bonus up to a difference of 0.75', () => {
    const lens = { sphere: 1, cylinder: -1, axis: 180 }
    expect(odScore({ sphere: 1, cylinder: -0.25, axis: 180 }, lens, true)).toBeCloseTo(0.63, 5)
    expect(odScore({ sphere: 1, cylinder: 0, axis: 0 }, lens, true)).toBeCloseTo(1, 5)
  })

  test('the spherical equivalent bonus is 0.55 for a plus lens and 0.5 from a sphere of 0', () => {
    expect(
      odScore({ sphere: 1, cylinder: -1, axis: 90 }, { sphere: 0.75, cylinder: -0.5, axis: 90 }),
    ).toBeCloseTo(0.45, 5)
    expect(
      odScore({ sphere: 0.25, cylinder: -1, axis: 90 }, { sphere: 0, cylinder: -0.5, axis: 90 }),
    ).toBeCloseTo(0.5, 5)
  })

  test('contrary differences also count for a minus lens', () => {
    expect(
      odScore({ sphere: -1, cylinder: -0.5, axis: 90 }, { sphere: -0.75, cylinder: -1, axis: 90 }),
    ).toBeCloseTo(0.25, 5)
  })

  test('equal spheres are never contrary differences', () => {
    expect(
      odScore({ sphere: 1, cylinder: -0.5, axis: 90 }, { sphere: 1, cylinder: -1, axis: 90 }),
    ).toBeCloseTo(0.38, 5)
  })

  test('the spherical equivalent bonus stops above a cylinder difference of 1', () => {
    expect(
      odScore({ sphere: 1, cylinder: -1.5, axis: 180 }, { sphere: 0.25, cylinder: 0, axis: 0 }),
    ).toBeCloseTo(2, 5)
  })
})
