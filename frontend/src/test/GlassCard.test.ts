import GlassCard from '@/components/GlassCard.vue'
import { MatchResult } from '@/lib/interleave'
import { createGlassesEqualOdOs, renderWithVuetify } from './util'

const [pair] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })

function renderCard(modelValue: object) {
  return renderWithVuetify(GlassCard, { props: { modelValue } })
}

test('shows PhilScore and the blur grade when both found the pair', () => {
  const match: MatchResult = {
    ...pair,
    algorithm: 'philscore',
    score: 0.25,
    odScore: 0.1,
    osScore: 0.15,
    grade: 'good',
  }
  const card = renderCard(match)
  expect(card.getByText('good')).toBeTruthy()
  expect(card.getByText('0.25')).toBeTruthy()
  expect(card.getByText('0.15')).toBeTruthy()
})

test('shows only the grade when only blurscore found the pair', () => {
  const match: MatchResult = { ...pair, algorithm: 'blurscore', grade: 'fair' }
  const card = renderCard(match)
  expect(card.getByText('fair')).toBeTruthy()
  expect(card.queryByText(/^\d+\.\d\d$/)).toBeNull()
})

test('shows neither for plain glasses', () => {
  const card = renderCard(pair)
  expect(card.queryByText(/^(excellent|good|fair|poor)$/)).toBeNull()
  expect(card.queryByText(/^\d+\.\d\d$/)).toBeNull()
})
