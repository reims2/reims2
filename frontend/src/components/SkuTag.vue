<template>
  <v-sheet
    :color="struck ? 'surface-muted' : 'primary-tonal'"
    width="72"
    height="76"
    rounded="lg"
    class="d-flex flex-column align-center justify-center flex-shrink-0 text-tabular"
  >
    <span class="text-label-small font-weight-bold" style="letter-spacing: 0.1em">SKU</span>
    <span
      class="text-title-large font-weight-bold"
      :class="{ 'text-decoration-line-through': struck }"
    >
      {{ sku }}
    </span>
    <span v-if="struck" class="text-label-small font-weight-bold">
      {{ state === 'dispensed' ? 'Dispensed' : 'Deleted' }}
    </span>
    <v-chip
      v-else-if="score != null"
      size="x-small"
      label
      variant="flat"
      :color="scoreColor(score)"
      class="font-weight-bold"
    >
      <v-tooltip
        activator="parent"
        location="bottom"
        text="PhilScore, lower is better"
        aria-label="PhilScore, lower is better"
      />
      {{ score.toFixed(2) }}
    </v-chip>
  </v-sheet>
</template>

<script setup lang="ts">
import { scoreColor } from '@/lib/color'

const { state = 'stock', score = null } = defineProps<{
  sku: string
  state?: 'stock' | 'dispensed' | 'deleted'
  score?: number | null
}>()

const struck = computed(() => state === 'dispensed' || state === 'deleted')
</script>
