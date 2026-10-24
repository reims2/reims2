import interleave, { MatchResult } from '@/lib/interleave'
import { BlurResult } from '@/lib/blurscore'
import { GlassesResult } from '@/model/GlassesModel'
import { createGlassesEqualOdOs } from './util'

const [base] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })

function philscore(...ids: number[]): GlassesResult[] {
  return ids.map((id, i) => ({ ...base, id, sku: id, score: i, odScore: i / 2, osScore: i / 2 }))
}

function blurscore(...ids: number[]): BlurResult[] {
  return ids.map((id, i) => ({
    ...base,
    id,
    sku: id,
    score: 10 + i,
    odScore: 10,
    osScore: 10,
    grade: 'good',
    odError: null,
    osError: null,
  }))
}

// e.g. 'p1' for pair 1 added by PhilScore
const picks = (results: MatchResult[]) => results.map((result) => result.algorithm[0] + result.id)

describe('interleave', () => {
  it('alternates, PhilScore first', () => {
    const results = interleave(philscore(1, 2, 3), blurscore(11, 12, 13), true)
    expect(picks(results)).toEqual(['p1', 'b11', 'p2', 'b12', 'p3', 'b13'])
  })

  it('alternates, blurscore first', () => {
    const results = interleave(philscore(1, 2, 3), blurscore(11, 12, 13), false)
    expect(picks(results)).toEqual(['b11', 'p1', 'b12', 'p2', 'b13', 'p3'])
  })

  it('fills with the longer list once the shorter one runs out', () => {
    const results = interleave(philscore(1), blurscore(11, 12, 13), true)
    expect(picks(results)).toEqual(['p1', 'b11', 'b12', 'b13'])
  })

  it('lists a pair found by both once, for the first to add it', () => {
    const results = interleave(philscore(1, 2), blurscore(1, 12), true)
    expect(picks(results)).toEqual(['p1', 'b12', 'p2'])
  })

  it('gives a shared pair both scores, whoever added it', () => {
    const [shared] = interleave(philscore(1), blurscore(1), false)
    expect(shared).toMatchObject({ id: 1, algorithm: 'blurscore', score: 0, grade: 'good' })
  })

  it('gives a blurscore-only pair no PhilScore', () => {
    const [result] = interleave([], blurscore(11), true)
    expect(result).toMatchObject({ id: 11, sku: 11, algorithm: 'blurscore', grade: 'good' })
    expect(result.score).toBeUndefined()
    expect(result.odScore).toBeUndefined()
    expect(result.osScore).toBeUndefined()
  })

  it('gives a PhilScore-only pair no grade', () => {
    const [, result] = interleave(philscore(1, 2), [], true)
    expect(result).toMatchObject({ id: 2, algorithm: 'philscore', score: 1, odScore: 0.5 })
    expect(result.grade).toBeUndefined()
  })

  it('stops at max', () => {
    const many = Array.from({ length: 20 }, (_, i) => i + 1)
    const results = interleave(philscore(...many), blurscore(...many.map((id) => id + 100)), true)
    expect(results).toHaveLength(30)
    expect(interleave(philscore(1, 2), blurscore(11, 12), true, 3)).toHaveLength(3)
  })

  it('returns nothing when neither finds a pair', () => {
    expect(interleave([], [], true)).toEqual([])
  })
})
