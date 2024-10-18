<template>
  <div class="d-flex align-end fill-height pb-1">
    <v-text-field
      v-model="modelValue.min"
      type="number"
      step="0.25"
      label="From"
      hide-details
      density="compact"
      style="max-width: 50px"
      class="mr-1"
      variant="underlined"
      single-line
      @update:model-value="(val) => (modelValue.min = parseFloat(val))"
    />
    <v-text-field
      v-model="modelValue.max"
      type="number"
      step="0.25"
      hide-details
      density="compact"
      style="max-width: 50px"
      label="To"
      variant="underlined"
      single-line
      @update:model-value="(val) => (modelValue.max = parseFloat(val))"
    />
  </div>
</template>

<script setup lang="ts">
import { MinMaxObject } from '@/model/ReimsModel'
defineModel<MinMaxObject>('modelValue', { required: true })
</script>
