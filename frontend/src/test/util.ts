import { render, RenderOptions, RenderResult } from '@testing-library/vue'
import { createVuetify } from 'vuetify'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderWithVuetify(component: any, options: RenderOptions) {
  const vuetify = createVuetify()
  return render(component, {
    ...options,
    global: {
      plugins: [vuetify],
    },
  })
}

export function getEmittedModelValues(wrapper: RenderResult): (string | null)[] {
  return wrapper.emitted()['update:modelValue'][0] as (string | null)[]
}
