import { Eye, Glasses, GlassesSearch, GlassesType } from '@/model/GlassesModel'
import calculateAllBlurscore, { BlurGrade } from '../lib/blurscore'
import { createGlasses, createSearchOdOnly } from './util'

function eye(sphere: number, cylinder = 0, axis = 0, add?: number): Eye {
  return { sphere, cylinder, axis, add }
}

function search(glassesType: GlassesType, od: Eye, os = od, highTolerance = false): GlassesSearch {
  return { glassesType, od: { ...od, isBAL: false }, os: { ...os, isBAL: false }, highTolerance }
}

function lenses(glassesType: GlassesType, od: Eye, os = od, sku = 1): Glasses {
  return { ...createGlasses(glassesType, od, os)[0], id: sku, sku }
}

function scoreOf(glassesType: GlassesType, rx: Eye, od: Eye, os = od): number | undefined {
  return calculateAllBlurscore(search(glassesType, rx), [lenses(glassesType, od, os)])[0]?.score
}

// Worked examples of docs/src/dev/ai-notes/predicted-blur-matching.md, same lens on both eyes
const examples: [string, Eye, Eye, number, BlurGrade][] = [
  ['axis 10 degrees off', eye(-1.5, -1.5, 90), eye(-1.5, -1.5, 100), 0.3, 'good'],
  ['sphere 0.25 off', eye(-1.5, -1.5, 90), eye(-1.75, -1.5, 90), 0.25, 'excellent'],
  ['exact SE, 0.50 D less cylinder', eye(-1.5, -1.5, 90), eye(-1.75, -1, 90), 0.29, 'good'],
  ['exact SE, 1.00 D less cylinder', eye(-1.5, -1.5, 90), eye(-2, -0.5, 90), 0.57, 'fair'],
  ['high cylinder, axis 8 degrees off', eye(-1, -3, 0), eye(-1, -3, 8), 0.33, 'good'],
  ['plus Rx, exact SE', eye(2, -1, 90), eye(1.75, -0.5, 90), 0.33, 'good'],
  ['plus Rx, 0.25 too much plus', eye(2, -1, 90), eye(2.25, -1, 90), 0.25, 'excellent'],
  ['plus Rx, 0.25 too much minus', eye(2, -1, 90), eye(1.75, -1, 90), 0.375, 'good'],
  ['add 0.50 too low', eye(1, 0, 0, 2.5), eye(1, 0, 0, 2), 0.5, 'good'],
  ['same reading power', eye(1, 0, 0, 2.5), eye(1.25, 0, 0, 2.25), 0.25, 'excellent'],
  ['both eyes 0.25 off', eye(-2), eye(-2.25), 0.25, 'excellent'],
]

test.each(examples)('Worked example: %s', (_, rx, lens, score, grade) => {
  const glassesType = rx.add === undefined ? 'single' : 'multifocal'
  const result = calculateAllBlurscore(search(glassesType, rx), [lenses(glassesType, lens)])
  expect(result).toHaveLength(1)
  expect(result[0].score).toBeCloseTo(score, 2)
  expect(result[0].grade).toBe(grade)
})

test('Worked example: eyes 0.25 off in opposite directions', () => {
  const result = calculateAllBlurscore(search('single', eye(-2)), [
    lenses('single', eye(-2.25), eye(-1.75)),
  ])
  expect(result).toHaveLength(1)
  expect(result[0].score).toBeCloseTo(0.375)
  expect(result[0].grade).toBe('good')
})

test('Worked example: a pair no better than no glasses is dropped, even with high tolerance', () => {
  const result = calculateAllBlurscore(search('single', eye(-0.5), eye(-0.5), true), [
    lenses('single', eye(-1)),
  ])
  expect(result).toHaveLength(0)
})

test('A score over 0.75 needs high tolerance and grades poor', () => {
  const glasses = [lenses('single', eye(-4))]
  expect(calculateAllBlurscore(search('single', eye(-3)), glasses)).toHaveLength(0)
  const result = calculateAllBlurscore(search('single', eye(-3), eye(-3), true), glasses)
  expect(result).toHaveLength(1)
  expect(result[0].score).toBeCloseTo(1)
  expect(result[0].grade).toBe('poor')
})

test('Eyes more than 1 D apart in focus error are dropped', () => {
  const rx = search('single', eye(-3), eye(-3), true)
  // scores 1.19, under the high tolerance limit
  expect(calculateAllBlurscore(rx, [lenses('single', eye(-2.5), eye(-3.75))])).toHaveLength(0)
  expect(calculateAllBlurscore(rx, [lenses('single', eye(-2.5), eye(-3.5))])).toHaveLength(1)
})

test('An eye more than 0.25 D blurrier than with no glasses drops the pair', () => {
  const rx = search('single', eye(-0.25), eye(-3), true)
  expect(calculateAllBlurscore(rx, [lenses('single', eye(-1), eye(-3))])).toHaveLength(0)
  expect(calculateAllBlurscore(rx, [lenses('single', eye(-0.75), eye(-3))])).toHaveLength(1)
})

test('Extra minus costs more only on a plus single vision Rx', () => {
  expect(scoreOf('single', eye(2), eye(1.75))).toBeCloseTo(0.375)
  // plus sphere, but a minus SE
  expect(scoreOf('single', eye(0.5, -1.5, 90), eye(0.25, -1.5, 90))).toBeCloseTo(0.25)
  expect(scoreOf('single', eye(-2), eye(-2.25))).toBeCloseTo(0.25)
  expect(scoreOf('multifocal', eye(2, 0, 0, 2), eye(1.75, 0, 0, 2.25))).toBeCloseTo(0.25)
})

test('Too much reading power costs less than too little', () => {
  expect(scoreOf('multifocal', eye(1, 0, 0, 2), eye(1, 0, 0, 2.5))).toBeCloseTo(0.375)
  expect(scoreOf('multifocal', eye(1, 0, 0, 2), eye(1, 0, 0, 1.5))).toBeCloseTo(0.5)
})

test('Axis error wraps around 180', () => {
  const rx = eye(-1, -1, 5)
  expect(scoreOf('single', rx, eye(-1, -1, 175))).toBeCloseTo(
    scoreOf('single', rx, eye(-1, -1, 15))!,
    9,
  )
})

test('A BAL eye is not scored, but its lens SE must be within 1 D of the other lens', () => {
  const rx = createSearchOdOnly('single', eye(-2))
  const result = calculateAllBlurscore(rx, [lenses('single', eye(-2.25), eye(-3))])
  expect(result).toHaveLength(1)
  expect(result[0].score).toBeCloseTo(0.25)
  expect(result[0].osScore).toBe(0)
  expect(result[0].osError).toBeNull()
  expect(calculateAllBlurscore(rx, [lenses('single', eye(-2.25), eye(-3.5))])).toHaveLength(0)
})

test('The BAL lens SE is compared with the other lens, not the Rx', () => {
  // the OD lens is 1.00 from the OS Rx, but 1.25 from the OS lens
  const rx = { ...search('single', eye(0), eye(-2)), od: { ...eye(0), isBAL: true } }
  expect(calculateAllBlurscore(rx, [lenses('single', eye(-3), eye(-1.75))])).toHaveLength(0)
  expect(calculateAllBlurscore(rx, [lenses('single', eye(-2.75), eye(-1.75))])).toHaveLength(1)
})

test('The no-glasses baseline has no balance term', () => {
  // scores 1.06, better than no glasses only if their 1.25 D imbalance counted
  const rx = search('single', eye(0), eye(-1.25), true)
  expect(calculateAllBlurscore(rx, [lenses('single', eye(0.25), eye(-0.25))])).toHaveLength(0)
})

test('Stock lenses in plus cylinder or at axis 180 match like their usual form', () => {
  expect(scoreOf('single', eye(-1, -1, 90), eye(-2, 1, 0))).toBeCloseTo(0, 9)
  expect(scoreOf('single', eye(-1, -1, 0), eye(-1, -1, 180))).toBeCloseTo(0, 9)
})

test('Only glasses of the searched type are considered', () => {
  const multifocal = lenses('multifocal', eye(-2, 0, 0, 2))
  expect(calculateAllBlurscore(search('single', eye(-2)), [multifocal])).toHaveLength(0)
})

test('Multifocals without an add are skipped', () => {
  // read as add 0, it would score 1.00 under the high tolerance limit
  const rx = search('multifocal', eye(1, 0, 0, 1), eye(1, 0, 0, 1), true)
  expect(calculateAllBlurscore(rx, [lenses('multifocal', eye(1))])).toHaveLength(0)
})

test('Each result has the errors per eye', () => {
  const rx = eye(2, -1, 90, 2)
  const result = calculateAllBlurscore(search('multifocal', rx), [
    lenses('multifocal', eye(1.75, -0.5, 90, 2.5), eye(2.25, -1, 90, 2)),
  ])
  expect(result).toHaveLength(1)
  const { odError, osError } = result[0]
  expect(odError?.focusError).toBeCloseTo(0)
  expect(odError?.leftoverCylinder).toBeCloseTo(0.5)
  expect(odError?.readingError).toBeCloseTo(0.5)
  expect(osError?.focusError).toBeCloseTo(0.25)
  expect(osError?.leftoverCylinder).toBeCloseTo(0)
  expect(osError?.readingError).toBeCloseTo(0.25)
  expect(result[0].osScore).toBeCloseTo(0.25)
})

test('Results are sorted by score, then by the worse eye, then by SKU', () => {
  const glasses = [
    lenses('single', eye(-1.75, -0.5, 90), eye(-2), 10), // 0.375, worse eye 0.5
    lenses('single', eye(-2.25), eye(-1.75), 30), // 0.375, worse eye 0.25
    lenses('single', eye(-2.25), eye(-1.75), 20),
    lenses('single', eye(-2), eye(-2), 40),
  ]
  const result = calculateAllBlurscore(search('single', eye(-2)), glasses)
  expect(result.map((r) => r.sku)).toEqual([40, 20, 30, 10])
})
