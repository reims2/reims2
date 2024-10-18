<template>
  <v-text-field
    ref="input"
    v-model="inputVal"
    :label="label"
    :rules="rules"
    :hint="hint"
    :autofocus="first && !mobile"
    clearable
    :persistent-hint="persistentHint"
    hide-details="auto"
    autocorrect="off"
    autocapitalize="off"
    @keyup.a.stop
    @keyup.s.stop
    @blur="autoComplete()"
  />
</template>

<script setup lang="ts">
import { GeneralGlassesData } from '@/model/GlassesModel'
import { ValidationRule } from '@/model/ReimsModel'

import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()

interface Props {
  label: string
  rules: ValidationRule[]
  hint: string
  items: GeneralGlassesData[]
  first?: boolean
  persistentHint?: boolean
}
const { label, rules, hint, items, first = false, persistentHint = false } = defineProps<Props>()

const inputVal = defineModel<string>('modelValue')

const input = useTemplateRef('input')

onMounted(() => {
  if (!mobile.value) focus()
})

function focus() {
  input.value?.focus()
  input.value?.select()
}

defineExpose({ focus })

function autoComplete() {
  /** autocomplete item data based on first characters. i.e. for id=glassesType return single for character s.
   * Otherwise emit no input i.e. no change */
  const value = inputVal.value
  if (!value || typeof value !== 'string' || value === '') return

  for (const item of items) {
    if (item.startsWith(value.toLowerCase())) return (inputVal.value = item)
  }
}
</script>
