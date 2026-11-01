<template>
  <div role="group" :aria-label="label" class="d-flex align-center ga-2">
    <span class="text-label-large font-weight-bold text-primary text-no-wrap">{{ label }}</span>
    <v-text-field
      v-model="modelValue.min"
      type="number"
      step="0.25"
      label="From"
      single-line
      hide-details
      density="compact"
      variant="outlined"
      width="96"
    />
    <span class="text-body-medium text-medium-emphasis">to</span>
    <v-text-field
      v-model="modelValue.max"
      type="number"
      step="0.25"
      label="To"
      single-line
      hide-details
      density="compact"
      variant="outlined"
      width="96"
    />
  </div>
</template>

<script setup lang="ts">
import { MinMaxObject } from '@/model/ReimsModel'

defineProps<{ label: string }>()
const modelValue = defineModel<MinMaxObject>('modelValue', { required: true })
</script>
