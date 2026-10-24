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

const ids = (results: MatchResult[]) => results.map((result) => result.id)
const algorithms = (results: MatchResult[]) => results.map((result) => result.algorithm)

describe('interleave', () => {
  it('alternates, PhilScore first', () => {
    const results = interleave(philscore(1, 2, 3), blurscore(11, 12, 13), true)
    expect(ids(results)).toEqual([1, 11, 2, 12, 3, 13])
    expect(algorithms(results)).toEqual([
      'philscore',
      'blurscore',
      'philscore',
      'blurscore',
      'philscore',
      'blurscore',
    ])
  })

  it('alternates, blurscore first', () => {
    const results = interleave(philscore(1, 2, 3), blurscore(11, 12, 13), false)
    expect(ids(results)).toEqual([11, 1, 12, 2, 13, 3])
  })

  it('fills with the longer list once the shorter one runs out', () => {
    const results = interleave(philscore(1), blurscore(11, 12, 13), true)
    expect(ids(results)).toEqual([1, 11, 12, 13])
    expect(algorithms(results)).toEqual(['philscore', 'blurscore', 'blurscore', 'blurscore'])
  })

  it('lists a pair found by both once, for the first to add it', () => {
    const results = interleave(philscore(1, 2), blurscore(1, 12), true)
    expect(ids(results)).toEqual([1, 12, 2])
    expect(algorithms(results)).toEqual(['philscore', 'blurscore', 'philscore'])
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
