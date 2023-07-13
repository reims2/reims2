<template>
  <v-text-field
    ref="input"
    v-model="inputVal"
    :label="label"
    :rules="rules"
    :hint="hint"
    :autofocus="first && !rootStore.isMobile"
    outlined
    clearable
    :persistent-hint="persistentHint"
    hide-details="auto"
    autocorrect="off"
    autocapitalize="off"
    @keyup.a.stop
    @keyup.s.stop
    @blur="autoComplete(id)"
    @focus="$event.target.select()"
  />
</template>

<script setup lang="ts">
import { generalEyeData } from '@/lib/util'
import { ValidationRule } from '@/model/ReimsModel'

import { useRootStore } from '@/stores/root'
import { computed, ref } from 'vue'

const rootStore = useRootStore()

interface Props {
  modelValue: string
  label: string
  rules: ValidationRule[]
  hint: string
  id: string
  first: boolean
  persistentHint: boolean
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  first: false,
  persistentHint: false,
})
const emit = defineEmits(['update:modelValue'])

const input = ref<HTMLInputElement | null>(null)

focus()

const inputVal = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  },
})

function autoComplete(id: string) {
  /** autocomplete item data based on first characters. i.e. for id=glassesType return single for character s.
   * Otherwise emit no input i.e. no change */
  const glassesString = inputVal.value
  if (!glassesString || typeof glassesString !== 'string' || glassesString === '') return
  const data = generalEyeData.find((obj) => {
    return obj.id === id
  })
  if (!data) return

  for (const item of data.items) {
    if (item.startsWith(glassesString.toLowerCase())) return emit('update:modelValue', item)
  }
}

function focus() {
  input.value?.focus()
}
</script>
