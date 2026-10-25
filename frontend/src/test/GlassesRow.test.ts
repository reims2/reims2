import GlassesRow from '@/components/GlassesRow.vue'
import { MatchResult } from '@/lib/interleave'
import { createGlassesEqualOdOs, renderWithVuetify } from './util'

const [pair] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })
const marker = 'Experimental suggestion from a new matching method'

function renderRow(glasses: MatchResult) {
  return renderWithVuetify(GlassesRow, { props: { glasses } })
}

test('marks an alternative as experimental and keeps its PhilScore', () => {
  const match: MatchResult = {
    ...pair,
    algorithm: 'blurscore',
    score: 0.25,
    odScore: 0.1,
    osScore: 0.15,
  }
  const row = renderRow(match)
  expect(row.getByLabelText(marker)).toBeTruthy()
  expect(row.getByText('0.25')).toBeTruthy()
})

test('shows no PhilScore for an alternative PhilScore did not find', () => {
  const row = renderRow({ ...pair, algorithm: 'blurscore' })
  expect(row.getByLabelText(marker)).toBeTruthy()
  expect(row.queryByText(/^\d+\.\d\d$/)).toBeNull()
})

test('shows no marker for a PhilScore pick', () => {
  const row = renderRow({
    ...pair,
    algorithm: 'philscore',
    score: 0.25,
    odScore: 0.1,
    osScore: 0.15,
  })
  expect(row.queryByLabelText(marker)).toBeNull()
  expect(row.getByText('0.25')).toBeTruthy()
})
