import { BlurGrade, BlurResult } from '@/lib/blurscore'
import { Glasses, GlassesResult, MatchAlgorithm } from '@/model/GlassesModel'

export interface MatchResult extends Glasses {
  algorithm: MatchAlgorithm // the list that placed this pair
  score?: number // PhilScore, only when PhilScore found the pair
  odScore?: number
  osScore?: number
  grade?: BlurGrade // only when blurscore found the pair
}

// Team-draft interleaving (Radlinski et al. 2008) with one coin per search: the lists take turns
// adding their best unlisted pair, and the other fills once one runs out.
export default function interleave(
  philscore: GlassesResult[],
  blurscore: BlurResult[],
  philscoreFirst: boolean,
  max = 30,
): MatchResult[] {
  const results: MatchResult[] = []
  const unlisted = (list: GlassesResult[]) =>
    list.find((glass) => !results.some((result) => result.id === glass.id))

  while (results.length < max) {
    const philscoreTurn = (results.length % 2 === 0) === philscoreFirst
    const fromPhilscore = unlisted(philscore)
    const fromBlurscore = unlisted(blurscore)
    const glass = (philscoreTurn ? fromPhilscore : fromBlurscore) ?? fromPhilscore ?? fromBlurscore
    if (!glass) break
    const phil = philscore.find((result) => result.id === glass.id)
    results.push({
      ...glass,
      algorithm: glass === fromPhilscore ? 'philscore' : 'blurscore',
      // a BlurResult reuses these fields for blur, so take them from PhilScore only
      score: phil?.score,
      odScore: phil?.odScore,
      osScore: phil?.osScore,
      grade: blurscore.find((result) => result.id === glass.id)?.grade,
    })
  }
  return results
}
