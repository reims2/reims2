import { render, RenderOptions, RenderResult } from '@testing-library/vue'
import { createVuetify } from 'vuetify'
import { createTestingPinia, TestingPinia } from '@pinia/testing'
import { vuetifyOptions } from '@/plugins/vuetify'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderWithVuetify(
  component: any,
  options: RenderOptions,
  pinia?: TestingPinia | undefined,
) {
  const vuetify = createVuetify(vuetifyOptions)
  return render(component, {
    ...options,
    global: {
      plugins: [vuetify, pinia || createTestingPinia()],
    },
  })
}

export function getEmittedModelValues(wrapper: RenderResult): (string | null)[] {
  return wrapper.emitted()['update:modelValue'][0] as (string | null)[]
}
