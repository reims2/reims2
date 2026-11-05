<template>
  <!-- the wordmark's shrinking letters as a small eye chart, for empty states -->
  <v-sheet
    :color="variant === 'blurred' ? 'marigold-tonal' : 'background'"
    rounded="lg"
    width="240"
    class="d-flex justify-center py-5 mx-auto"
    aria-hidden="true"
  >
    <v-sheet
      width="152"
      rounded="md"
      :color="variant === 'faded' ? 'surface-light' : 'surface'"
      :border="variant === 'faded' ? 'dashed' : true"
      :elevation="variant === 'faded' ? 0 : 1"
      class="eye-chart d-flex flex-column align-center ga-2 pt-5 pb-4"
      :class="{ 'eye-chart--faded': variant === 'faded' }"
    >
      <template v-for="(row, index) in rows" :key="row.text">
        <div
          v-if="index === readingLine"
          class="eye-chart__line"
          :class="variant === 'faded' ? 'bg-surface-muted' : 'bg-marigold-bright'"
        />
        <span
          :style="{ fontSize: `${row.size}px`, filter: blur(index) }"
          :class="{ 'text-medium-emphasis': variant === 'blurred' && index > 1 }"
        >
          {{ row.text }}
        </span>
      </template>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
// sharp before a search, lower rows blurred when nothing fits, faded for an empty list
const { variant = 'sharp' } = defineProps<{ variant?: 'sharp' | 'blurred' | 'faded' }>()

const rows = [
  { text: 'E', size: 36 },
  { text: 'F P', size: 24 },
  { text: 'T O Z', size: 17 },
  { text: 'L P E D', size: 12 },
  { text: 'P E C F D', size: 9 },
  { text: 'E D F C Z P', size: 7 },
]
const readingLine = 4

function blur(index: number) {
  if (variant !== 'blurred' || index < 2) return undefined
  return `blur(${Math.min(1.2 + (index - 2) * 0.6, 2.4)}px)`
}
</script>

<style scoped>
.eye-chart {
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.2em;
  padding-left: 0.2em;
}
.eye-chart--faded {
  color: #ddd5c7;
}
.eye-chart__line {
  width: 100px;
  height: 2px;
  border-radius: 2px;
  margin-left: -0.2em;
}
</style>
