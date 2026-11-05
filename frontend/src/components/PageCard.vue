<template>
  <v-card rounded="xl" border elevation="1" role="region" :aria-labelledby="headingId">
    <v-sheet
      min-height="68"
      class="d-flex align-center justify-space-between ga-3 py-3 pr-5 border-b"
      :class="icon ? 'pl-4' : 'pl-6'"
    >
      <div class="d-flex align-center ga-3">
        <v-avatar
          v-if="icon"
          :color="tone === 'marigold' ? 'marigold-tonal' : 'primary-tonal'"
          size="36"
        >
          <v-icon :icon="icon" size="20" :color="tone === 'marigold' ? 'marigold' : 'primary'" />
        </v-avatar>
        <h2 :id="headingId" class="text-title-large font-weight-semibold ma-0">{{ title }}</h2>
      </div>
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
// teal tiles for cards you type into, marigold for the lists that come back
defineProps<{ title: string; icon?: string; tone?: 'primary' | 'marigold' }>()
const headingId = useId()
</script>
