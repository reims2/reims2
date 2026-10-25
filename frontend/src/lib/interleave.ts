import { BlurResult } from '@/lib/blurscore'
import { Glasses, GlassesResult, MatchAlgorithm } from '@/model/GlassesModel'

export interface MatchResult extends Glasses {
  algorithm: MatchAlgorithm // blurscore marks an experimental suggestion
  score?: number // PhilScore, only when PhilScore found the pair
  odScore?: number
  osScore?: number
}

const EPS = 1e-9 // equal blur scores can differ by float noise

// PhilScore's list, but the last card of each page of 3 goes to blurscore's best unlisted pair graded
// good or better, if it predicts less blur for it than for PhilScore's pick. It also fills once PhilScore runs out.
export default function interleave(
  philscore: GlassesResult[],
  blurscore: BlurResult[],
  max = 30,
): MatchResult[] {
  const results: MatchResult[] = []
  const unlisted = <T extends Glasses>(list: T[]) =>
    list.find((glass) => !results.some((result) => result.id === glass.id))
  const good = blurscore.filter((result) => result.grade === 'excellent' || result.grade === 'good')
  const blurOf = (glass?: Glasses) =>
    blurscore.find((result) => result.id === glass?.id)?.score ?? Infinity

  while (results.length < max) {
    const fromPhilscore = unlisted(philscore)
    const best = unlisted(good)
    const alternative =
      (results.length % 3 === 2 || !fromPhilscore) &&
      best !== undefined &&
      best.score < blurOf(fromPhilscore) - EPS
    const glass = alternative ? best : fromPhilscore
    if (!glass) break
    const phil = philscore.find((result) => result.id === glass.id)
    results.push({
      ...glass,
      algorithm: alternative ? 'blurscore' : 'philscore',
      // a BlurResult reuses these fields for blur, so take them from PhilScore only
      score: phil?.score,
      odScore: phil?.odScore,
      osScore: phil?.osScore,
    })
  }
  return results
}
