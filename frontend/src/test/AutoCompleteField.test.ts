import { fireEvent } from '@testing-library/vue'
import AutoCompleteField from '@/components/AutoCompleteField.vue'
import { test } from 'vitest'
import { renderWithVuetify, getEmittedModelValues } from './util'

test('should emit modelValue on input', async () => {
  const wrapper = renderWithVuetify(AutoCompleteField, {
    props: {
      label: 'uniqueLabel',
      hint: '',
      items: [],
      rules: [],
    },
  })

  // assert output
  const input = wrapper.getByLabelText('uniqueLabel')
  await fireEvent.update(input, 's')
  expect(getEmittedModelValues(wrapper)[0]).toBe('s')
})

test('should autoComplete on blur', async () => {
  const wrapper = renderWithVuetify(AutoCompleteField, {
    props: {
      modelValue: 's',
      label: 'uniqueLabel',
      hint: '',
      items: ['single', 'multifocal'],
      rules: [],
    },
  })

  // assert output
  const input = wrapper.getByLabelText('uniqueLabel')
  await fireEvent.blur(input)
  expect(getEmittedModelValues(wrapper)[0]).toBe('single')
})
