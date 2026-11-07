<template>
  <span
    class="d-inline-flex align-center font-weight-bold"
    :class="stacked ? 'flex-column ga-1' : 'ga-2'"
  >
    <svg
      viewBox="0 0 32 32"
      :width="stacked ? '2em' : '1.3em'"
      :height="stacked ? '2em' : '1.3em'"
      aria-hidden="true"
    >
      <circle cx="8.6" cy="16" r="5.4" :fill="lens" stroke="currentColor" stroke-width="2.4" />
      <circle cx="23.4" cy="16" r="5.4" :fill="lens" stroke="currentColor" stroke-width="2.4" />
      <path
        d="M13.7 13.8c1.4-1.8 3.2-1.8 4.6 0"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
      />
    </svg>
    <span class="d-sr-only">REIMS2</span>
    <!-- letters shrink like the rows of an eye chart -->
    <span
      class="d-inline-flex align-baseline"
      style="gap: 0.14em; line-height: 1"
      aria-hidden="true"
    >
      <span
        v-for="(size, index) in letterSizes"
        :key="index"
        :style="{ fontSize: `${size}em`, color: index === 5 ? two : undefined }"
      >
        {{ 'REIMS2'[index] }}
      </span>
    </span>
  </span>
</template>

<script setup lang="ts">
// icon above the letters, for the narrow rail
const { stacked = false } = defineProps<{ stacked?: boolean }>()

const lens = '#8fd6dd'
const two = 'rgb(var(--v-theme-marigold-bright))'

const letterSizes = [1, 0.86, 0.75, 0.66, 0.59, 0.53]
</script>
