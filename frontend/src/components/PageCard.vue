<template>
  <v-card rounded="xl" border elevation="1" role="region" :aria-labelledby="headingId">
    <v-sheet
      min-height="68"
      class="d-flex align-center justify-space-between ga-3 py-3 pl-6 pr-5 border-b"
    >
      <h2 :id="headingId" class="text-title-large font-weight-semibold ma-0">{{ title }}</h2>
      <slot name="header" />
    </v-sheet>
    <slot />
    <v-sheet
      v-if="$slots.footer"
      color="surface-light"
      class="d-flex flex-wrap align-center ga-4 px-6 py-4 border-t"
    >
      <slot name="footer" />
    </v-sheet>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
const headingId = useId()
</script>
