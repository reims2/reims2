<template>
  <v-sheet
    :color="tagColors[state]"
    width="72"
    height="76"
    rounded="lg"
    class="position-relative d-flex flex-column align-center justify-center flex-shrink-0 text-tabular"
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
    <div v-else class="d-flex align-center ga-1">
      <v-chip
        v-if="score != null"
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
      <span
        v-if="blurScore != null"
        class="d-inline-flex"
        role="img"
        :aria-label="`${experimentalText} Blur score: ${blurScore.toFixed(2)}`"
      >
        <v-tooltip activator="parent" location="bottom">
          <div>{{ experimentalText }}</div>
          <div class="font-weight-bold">Blur score: {{ blurScore.toFixed(2) }}</div>
        </v-tooltip>
        <v-icon size="14" :icon="mdiFlaskOutline" />
      </span>
    </div>
    <v-avatar
      v-if="state === 'dispensed'"
      color="success"
      size="26"
      border="md surface opacity-100"
      class="position-absolute top-0 right-0 mt-n2 mr-n2"
      aria-hidden="true"
    >
      <v-icon :icon="mdiCheckBold" size="14" />
    </v-avatar>
  </v-sheet>
</template>

<script setup lang="ts">
import { mdiCheckBold, mdiFlaskOutline } from '@mdi/js'
import { scoreColor } from '@/lib/color'

const experimentalText = 'Experimental suggestion from a new matching method. Try it!'

const {
  state = 'stock',
  score = null,
  blurScore = null,
} = defineProps<{
  sku: string
  state?: 'stock' | 'dispensed' | 'deleted'
  score?: number | null
  blurScore?: number | null
}>()

const tagColors = { stock: 'primary-tonal', dispensed: 'success-tonal', deleted: 'surface-muted' }

const struck = computed(() => state === 'dispensed' || state === 'deleted')
</script>
