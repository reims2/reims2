import type { Glasses, GlassesSearch, GlassesType, Pair } from '@/model/GlassesModel'
import { fitsSearch } from '@/lib/philscore'

// five ranges to pick from at the next refill, see docs/src/dev/ai-notes/refill-planning.md

export interface PastPatient {
  // the year of the campaign, each site runs one a year
  campaign: string
  search: GlassesSearch
}

interface Range {
  glassesType: GlassesType
  // average sphere of both eyes
  sphere: [number, number]
  // indices into cylinderBands, for the larger cylinder of both eyes
  cylinder: [number, number]
}

export interface RefillRule extends Range {
  pairs: number
}

export interface RefillPlan {
  rules: RefillRule[]
  // free SKUs no rule could use, for any glasses
  rest: number
}

// a dispensed pair stands in for the prescription it was found for
export function toPatients(
  gone: Glasses[],
  failed: { searchDate: string; search: GlassesSearch }[],
): PastPatient[] {
  return [
    ...gone
      .filter((g) => g.dispense?.dispenseReason === 'DISPENSED')
      .map((g) => ({
        campaign: (g.dispense?.modifyDate ?? g.creationDate).slice(0, 4),
        search: {
          glassesType: g.glassesType,
          od: { ...g.od, isBAL: false },
          os: { ...g.os, isBAL: false },
        },
      })),
    ...failed.map((f) => ({ campaign: f.searchDate.slice(0, 4), search: f.search })),
  ]
}

// upper bounds in diopters
export const cylinderBands = [0.5, 1.5, 2.5, Infinity]

const MAX_SPHERE_WIDTH = 2
const MIN_PAIRS_IN_RANGE = 3

const toHalf = (value: number) => Math.round(value / 0.5) * 0.5 || 0

interface Cell {
  glassesType: GlassesType
  sphere: number
  cylinder: number
}

interface Scored {
  range: Range
  size: number
  // the campaigns its pairs fit someone in, summed
  reach: number
  gain: number
}

function cellOf(pair: Pair): Cell {
  const cylinder = Math.max(Math.abs(pair.od.cylinder), Math.abs(pair.os.cylinder))
  return {
    glassesType: pair.glassesType,
    sphere: toHalf((pair.od.sphere + pair.os.sphere) / 2),
    cylinder: cylinderBands.findIndex((max) => cylinder <= max),
  }
}

const within = (value: number, [from, to]: [number, number]) => value >= from && value <= to
const meet = (a: [number, number], b: [number, number]) => a[0] <= b[1] && b[0] <= a[1]

const overlaps = (a: Range, b: Range) =>
  a.glassesType === b.glassesType && meet(a.sphere, b.sphere) && meet(a.cylinder, b.cylinder)

// [from, to] of sorted values no more than maxWidth apart
const spans = (values: number[], maxWidth = Infinity) =>
  values.flatMap((v, i) =>
    values
      .slice(i)
      .filter((w) => w - v <= maxWidth)
      .map((w): [number, number] => [v, w]),
  )

// every range of one type with enough pairs that fit someone
function scoreRanges(
  glassesType: GlassesType,
  cells: (Cell & { useful: number })[],
  perRule: number,
): Scored[] {
  const spheres = [...new Set(cells.map((c) => c.sphere))].sort((a, b) => a - b)
  const bands = cylinderBands.map((_, i) => i)
  return spans(spheres, MAX_SPHERE_WIDTH).flatMap((sphere) => {
    const bySphere = cells.filter((c) => within(c.sphere, sphere))
    return spans(bands).flatMap((cylinder) => {
      const inside = bySphere.filter((c) => within(c.cylinder, cylinder))
      const n = inside.length
      const h = inside.reduce((sum, c) => sum + c.useful, 0)
      if (n < MIN_PAIRS_IN_RANGE || h === 0) return []
      const range = { glassesType, sphere, cylinder }
      return [{ range, size: n, reach: h, gain: Math.min(perRule, n) * (h / n) }]
    })
  })
}

/**
 * Finds the past patients no pair in stock fits, then the ranges where a pair the site has had
 * most often fits one of them. Each range gets as many pairs as the site has had there, more would
 * repeat prescriptions. The range that reaches the most patients goes first, what is left goes to
 * any glasses.
 *
 * @param history every pair the site ever had, standing in for what refills are picked from
 */
export function planRefill(
  stock: Pair[],
  history: Pair[],
  patients: PastPatient[],
  freeSkus: number,
  ruleCount = 5,
): RefillPlan {
  const unserved = patients.filter((p) => !stock.some((pair) => fitsSearch(p.search, pair)))
  const inStock = new Set(stock)
  const cells = history.map((pair) => ({
    ...cellOf(pair),
    // the campaigns in which it fits someone stock can't serve, so retries count once. Stock fits
    // no one by definition
    useful: inStock.has(pair)
      ? 0
      : new Set(unserved.filter((p) => fitsSearch(p.search, pair)).map((p) => p.campaign)).size,
  }))

  // a range's gain doesn't depend on the others, so the greedy pick walks one sorted list
  const scored = (['single', 'multifocal'] as const)
    .flatMap((type) =>
      scoreRanges(
        type,
        cells.filter((c) => c.glassesType === type),
        freeSkus / ruleCount,
      ),
    )
    .sort((a, b) => b.gain - a.gain)
  const chosen: Scored[] = []
  for (const candidate of scored) {
    if (chosen.length === ruleCount) break
    if (!chosen.some((c) => overlaps(c.range, candidate.range))) chosen.push(candidate)
  }

  let rest = freeSkus
  const rules = chosen
    .sort((a, b) => b.reach - a.reach)
    .flatMap(({ range, size }): RefillRule[] => {
      const pairs = Math.min(size, rest)
      if (pairs === 0) return []
      rest -= pairs
      return [{ ...range, pairs }]
    })

  return { rules, rest }
}
