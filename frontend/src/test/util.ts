import { render, RenderOptions, RenderResult } from '@testing-library/vue'
import { createVuetify } from 'vuetify'
import { createTestingPinia, TestingPinia } from '@pinia/testing'
import { vuetifyOptions } from '@/plugins/vuetify'

import { Eye, Glasses, GlassesSearch, GlassesType } from '@/model/GlassesModel'

export function renderWithVuetify<C>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: C,
  options: RenderOptions<C>,
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

export function createGlassesEqualOdOs(glassesType: GlassesType, eye: Eye): Glasses[] {
  return createGlasses(glassesType, eye, eye)
}

export function createGlasses(glassesType: GlassesType, od: Eye, os: Eye): Glasses[] {
  return [
    {
      appearance: 'neutral',
      glassesType,
      glassesSize: 'medium',
      od,
      os,
      id: 1,
      sku: 1,
      location: 'sa',
      creationDate: 0,
    },
  ]
}

export function createSearchOdOnly(glassesType: GlassesType, od: Eye): GlassesSearch {
  return {
    ...createSearchEqualLens(glassesType, od),
    os: {
      isBAL: true,
      sphere: 0,
      cylinder: 0,
      axis: 0,
    },
  }
}

export function createSearchEqualLens(glassesType: GlassesType, eye: Eye): GlassesSearch {
  return {
    glassesType,
    od: {
      ...eye,
      isBAL: false,
    },
    os: {
      ...eye,
      isBAL: false,
    },
    highTolerance: false,
  }
}
