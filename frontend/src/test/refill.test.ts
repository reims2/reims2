import calculateAllPhilscore, { fitsSearch } from '@/lib/philscore'
import { PastPatient, planRefill, toPatients } from '@/lib/refill'
import { Pair } from '@/model/GlassesModel'
import { createGlasses, createSearchEqualLens } from './util'

const eye = (sphere: number, cylinder = 0, axis = 0) => ({ sphere, cylinder, axis, add: 0 })
const single = (sphere: number, cylinder = 0): Pair => ({
  glassesType: 'single',
  od: eye(sphere, cylinder),
  os: eye(sphere, cylinder),
})
const patient = (sphere: number, campaign = '2025'): PastPatient => ({
  campaign,
  search: createSearchEqualLens('single', eye(sphere)),
})
const times = <T>(n: number, item: T) => Array.from({ length: n }, () => item)

describe('fitsSearch', () => {
  it('agrees with the PhilScore filter', () => {
    const search = createSearchEqualLens('single', eye(-1))
    for (const pair of [single(-1), single(-1.5), single(-2), single(-1, -1.25)]) {
      const listed = calculateAllPhilscore(search, createGlasses('single', pair.od, pair.os))
      expect(fitsSearch(search, pair)).toBe(listed.length > 0)
    }
  })
})

describe('planRefill', () => {
  const history = [...times(6, single(-1)), ...times(6, single(2)), ...times(6, single(5))]

  it('adds no rules when stock already fits every past patient', () => {
    const plan = planRefill([single(-1)], history, times(4, patient(-1)), 20)
    expect(plan.rules).toEqual([])
    expect(plan.rest).toBe(20)
  })

  it('names the range that fits the patients stock misses, up to the pairs the site had there', () => {
    const plan = planRefill([single(5)], history, times(4, patient(-1)), 20)
    expect(plan.rules).toEqual([
      {
        glassesType: 'single',
        sphere: [-1, -1],
        cylinder: [0, 0],
        pairs: 6,
      },
    ])
    expect(plan.rest).toBe(14)
  })

  it('keeps ranges apart and never hands out more than the free SKUs', () => {
    const patients = [...times(3, patient(-1)), ...times(3, patient(2, '2024'))]
    const plan = planRefill([single(5)], history, patients, 8)
    expect(plan.rules.map((r) => r.sphere)).toEqual([
      [-1, -1],
      [2, 2],
    ])
    expect(plan.rules.map((r) => r.pairs)).toEqual([6, 2])
    expect(plan.rest).toBe(0)
  })
})

describe('toPatients', () => {
  it('takes dispensed pairs and failed searches, not deleted pairs', () => {
    const [dispensed] = createGlasses('single', eye(-1), eye(-1))
    const [deleted] = createGlasses('single', eye(3), eye(3))
    const date = '2025-01-28T10:00:00Z'
    dispensed.dispense = { modifyDate: date, previousSku: 1, dispenseReason: 'DISPENSED' }
    deleted.dispense = { modifyDate: date, previousSku: 2, dispenseReason: 'BROKEN' }
    const search = createSearchEqualLens('multifocal', eye(2))
    const patients = toPatients(
      [dispensed, deleted],
      [{ searchDate: '2026-02-01T09:00:00Z', search }],
    )
    expect(patients).toHaveLength(2)
    expect(patients[0]).toMatchObject({
      campaign: '2025',
      search: { od: { sphere: -1, isBAL: false } },
    })
    expect(patients[1]).toEqual({ campaign: '2026', search })
  })
})
