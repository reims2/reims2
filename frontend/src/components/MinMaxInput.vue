<template>
  <div class="d-flex align-end fill-height pb-1">
    <v-text-field
      v-model="min"
      type="number"
      step="0.25"
      label="From"
      hide-details
      density="compact"
      style="max-width: 50px"
      class="mr-1"
      variant="underlined"
      single-line
      @change="change"
    />
    <v-text-field
      v-model="max"
      type="number"
      step="0.25"
      hide-details
      density="compact"
      style="max-width: 50px"
      label="To"
      variant="underlined"
      single-line
      @change="change"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const min = ref('')
const max = ref('')
const emit = defineEmits(['change'])

function change() {
  emit('change', { min: parseFloat(min.value), max: parseFloat(max.value) })
}
</script>
