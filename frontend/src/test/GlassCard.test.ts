import GlassCard from '@/components/GlassCard.vue'
import { MatchResult } from '@/lib/interleave'
import { createGlassesEqualOdOs, renderWithVuetify } from './util'

const [pair] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })
const marker = 'Experimental suggestion from a new matching method'

function renderCard(modelValue: object) {
  return renderWithVuetify(GlassCard, { props: { modelValue } })
}

test('marks an alternative as experimental and keeps its PhilScore', () => {
  const match: MatchResult = {
    ...pair,
    algorithm: 'blurscore',
    score: 0.25,
    odScore: 0.1,
    osScore: 0.15,
  }
  const card = renderCard(match)
  expect(card.getByLabelText(marker)).toBeTruthy()
  expect(card.getByText('0.25')).toBeTruthy()
})

test('shows no PhilScore for an alternative PhilScore did not find', () => {
  const card = renderCard({ ...pair, algorithm: 'blurscore' })
  expect(card.getByLabelText(marker)).toBeTruthy()
  expect(card.queryByText(/^\d+\.\d\d$/)).toBeNull()
})

test('shows no marker for a PhilScore pick', () => {
  const card = renderCard({
    ...pair,
    algorithm: 'philscore',
    score: 0.25,
    odScore: 0.1,
    osScore: 0.15,
  })
  expect(card.queryByLabelText(marker)).toBeNull()
  expect(card.getByText('0.25')).toBeTruthy()
})
