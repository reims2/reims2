import { compareScores, isGoodBlur } from '@/lib/blurscore'
import { Glasses, GlassesResult } from '@/model/GlassesModel'

export interface MatchResult extends Glasses {
  algorithm: 'philscore' | 'blurscore' // blurscore marks an experimental suggestion
  score?: number // PhilScore, only when PhilScore found the pair
  blurScore?: number // only when blurscore placed the pair
}

const MAX_RESULTS = 30

// PhilScore's list, but every third result goes to blurscore's best unlisted pair graded good or
// better, if it predicts less blur for it than for PhilScore's pick. It also fills once PhilScore runs out.
export default function interleave(
  philscore: GlassesResult[],
  blurscore: GlassesResult[],
): MatchResult[] {
  const results: MatchResult[] = []
  const unlisted = (list: GlassesResult[]) =>
    list.find((glass) => !results.some((result) => result.id === glass.id))
  const good = blurscore.filter((result) => isGoodBlur(result.score))
  const blurOf = (glass?: Glasses) =>
    blurscore.find((result) => result.id === glass?.id)?.score ?? Infinity

  while (results.length < MAX_RESULTS) {
    const fromPhilscore = unlisted(philscore)
    const best = unlisted(good)
    if (
      (results.length % 3 === 2 || !fromPhilscore) &&
      best &&
      compareScores(best.score, blurOf(fromPhilscore)) < 0
    ) {
      // best.score is its blur, so the PhilScore comes from PhilScore's list
      const score = philscore.find((result) => result.id === best.id)?.score
      results.push({ ...best, algorithm: 'blurscore', score, blurScore: best.score })
    } else if (fromPhilscore) {
      results.push({ ...fromPhilscore, algorithm: 'philscore' })
    } else break
  }
  return results
}
