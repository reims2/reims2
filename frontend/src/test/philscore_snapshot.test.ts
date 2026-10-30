import calculateAllPhilscore from '../lib/philscore'
import { Eye, Glasses, GlassesSearch, GlassesType } from '@/model/GlassesModel'
import { formatAxis, formatDiopter, formatSku } from '@/util/format-glasses'

/** Pins philscore.ts on a grid of searches, so any change in matching or ranking shows up here.
 * The output matched the REIMS1 oracle when this was written. If a change is a deliberate
 * divergence from REIMS1, document it in docs/src/philscore.md and update with `vitest -u`.
 */

// all OD lenses from the value lists, OS gets a slightly stronger sphere
function eyeGrid(spheres: number[], cylinders: number[], axes: number[]): Eye[] {
  return spheres.flatMap((sphere) =>
    cylinders.flatMap((cylinder) =>
      (cylinder === 0 ? [0] : axes).map((axis) => ({ sphere, cylinder, axis, add: 0 })),
    ),
  )
}
const types: GlassesType[] = ['single', 'multifocal']

const inventory: Glasses[] = types
  .flatMap((glassesType) =>
    eyeGrid([-4, -2.5, -1, 0, 1, 2.5, 4], [0, -0.25, -0.5, -1.25, -2.5], [10, 90, 170]).map(
      (od) => {
        const add = glassesType === 'multifocal' ? 2 : 0
        return { glassesType, od: { ...od, add }, os: { ...od, sphere: od.sphere + 0.5, add } }
      },
    ),
  )
  .map((pair, i) => ({
    ...pair,
    id: i + 1,
    sku: i + 1,
    appearance: 'neutral',
    glassesSize: 'medium',
    location: 'sa',
    creationDate: '2024-01-01T00:00:00.000+00:00',
  }))

const flags = ['none', 'high', 'BAL os'] as const
const searches: GlassesSearch[] = types.flatMap((glassesType) =>
  flags.flatMap((flag) =>
    eyeGrid([-3.75, -2.25, -0.75, 0.5, 1.25, 2.75], [0, -0.75, -1.5, -2.25], [0, 58, 165]).map(
      (od) => {
        const add = glassesType === 'multifocal' ? 2.25 : 0
        return {
          glassesType,
          od: { ...od, add, isBAL: false },
          os: { ...od, sphere: od.sphere + 0.5, add, isBAL: flag === 'BAL os' },
          highTolerance: flag === 'high',
        }
      },
    ),
  ),
)

const formatEye = (eye: Eye) =>
  `${formatDiopter(eye.sphere)} ${formatDiopter(eye.cylinder)} x${formatAxis(eye.axis)} ${formatDiopter(eye.add)}`

test('PhilScore results on a grid of searches', () => {
  const lines = searches.map((search) => {
    const results = calculateAllPhilscore(search, inventory)
    const flag = search.highTolerance ? ' high' : search.os.isBAL ? ' BAL os' : ''
    const top = results.slice(0, 5).map((r) => `${formatSku(r.sku)}:${r.score.toFixed(3)}`)
    return `${search.glassesType} od ${formatEye(search.od)} os ${formatEye(search.os)}${flag} -> ${results.length}: ${top.join(' ')}`
  })
  expect(lines).toMatchSnapshot()
})
