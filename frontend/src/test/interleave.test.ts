import interleave, { MatchResult } from '@/lib/interleave'
import { BlurResult } from '@/lib/blurscore'
import { GlassesResult } from '@/model/GlassesModel'
import { createGlassesEqualOdOs } from './util'

const [base] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })

function philscore(...ids: number[]): GlassesResult[] {
  return ids.map((id, i) => ({ ...base, id, sku: id, score: i, odScore: i / 2, osScore: i / 2 }))
}

// [id, predicted blur], graded like blurscore.ts
function blurscore(...pairs: [number, number][]): BlurResult[] {
  return pairs.map(([id, score]) => ({
    ...base,
    id,
    sku: id,
    score,
    odScore: score,
    osScore: score,
    grade: score <= 0.25 ? 'excellent' : score <= 0.5 ? 'good' : 'fair',
    odError: null,
    osError: null,
  }))
}

// e.g. 'p1' for pair 1 placed by PhilScore, 'b11' for an alternative
const picks = (results: MatchResult[]) => results.map((result) => result.algorithm[0] + result.id)

test('puts a good alternative last on each page and fills once PhilScore runs out', () => {
  const blur = blurscore([11, 0.25], [12, 0.5], [13, 0.75])
  expect(picks(interleave(philscore(1, 2, 3, 4), blur))).toEqual([
    'p1',
    'p2',
    'b11',
    'p3',
    'p4',
    'b12',
  ])
  expect(picks(interleave(philscore(1), blur))).toEqual(['p1', 'b11', 'b12'])
})

test('needs strictly less predicted blur than for PhilScore pick', () => {
  const phil = philscore(1, 2, 3)
  // blurscore ranks PhilScore's pick first, or ties with float noise
  expect(picks(interleave(phil, blurscore([3, 0], [11, 0.25])))).toEqual(['p1', 'p2', 'p3', 'b11'])
  expect(picks(interleave(phil, blurscore([11, 0.3], [3, 0.1 + 0.2])))).toEqual([
    'p1',
    'p2',
    'p3',
    'b11',
  ])
  expect(picks(interleave(phil, blurscore([11, 0.25], [3, 0.5])))).toEqual([
    'p1',
    'p2',
    'b11',
    'p3',
  ])
})

test('gives an alternative PhilScore did not find no PhilScore', () => {
  const [result] = interleave([], blurscore([11, 0.25]))
  expect(result).toMatchObject({
    id: 11,
    algorithm: 'blurscore',
    score: undefined,
    odScore: undefined,
    osScore: undefined,
  })
})
