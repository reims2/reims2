import { BlurGrade, BlurResult } from '@/lib/blurscore'
import { Glasses, GlassesResult, MatchAlgorithm } from '@/model/GlassesModel'

export interface MatchResult extends Glasses {
  algorithm: MatchAlgorithm // the list that placed this pair
  score?: number // PhilScore, only when PhilScore found the pair
  odScore?: number
  osScore?: number
  grade?: BlurGrade // only when blurscore found the pair
}

// Team-draft interleaving (Radlinski et al. 2008): the algorithm with fewer pairs listed so far
// adds its best unlisted pair, philscoreFirst breaks ties.
export default function interleave(
  philscore: GlassesResult[],
  blurscore: BlurResult[],
  philscoreFirst: boolean,
  max = 30,
): MatchResult[] {
  const lists: Record<MatchAlgorithm, GlassesResult[]> = { philscore, blurscore }
  const next = { philscore: 0, blurscore: 0 }
  const picks = { philscore: 0, blurscore: 0 }
  const philscoreById = new Map(philscore.map((result) => [result.id, result]))
  const gradeById = new Map(blurscore.map((result) => [result.id, result.grade]))
  const listed = new Set<number>()
  const results: MatchResult[] = []

  function nextUnlisted(algorithm: MatchAlgorithm): GlassesResult | undefined {
    const list = lists[algorithm]
    while (next[algorithm] < list.length && listed.has(list[next[algorithm]].id)) next[algorithm]++
    return list[next[algorithm]]
  }

  while (results.length < max) {
    const philscoreTurn =
      picks.philscore < picks.blurscore || (picks.philscore === picks.blurscore && philscoreFirst)
    const turn: MatchAlgorithm = philscoreTurn ? 'philscore' : 'blurscore'
    const algorithm = nextUnlisted(turn) ? turn : philscoreTurn ? 'blurscore' : 'philscore'
    const glass = nextUnlisted(algorithm)
    if (!glass) break

    listed.add(glass.id)
    picks[algorithm]++
    const phil = philscoreById.get(glass.id)
    results.push({
      ...glass,
      algorithm,
      // a BlurResult reuses these fields for blur, so take them from PhilScore only
      score: phil?.score,
      odScore: phil?.odScore,
      osScore: phil?.osScore,
      grade: gradeById.get(glass.id),
    })
  }
  return results
}
