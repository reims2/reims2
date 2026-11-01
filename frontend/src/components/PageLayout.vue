<template>
  <v-container max-width="1304" class="d-flex flex-column ga-6 px-4 px-sm-8 pt-7 pb-10">
    <div class="d-flex flex-wrap align-center ga-4">
      <h1 class="text-headline-medium font-weight-bold ma-0">{{ title }}</h1>
      <slot name="chips" />
    </div>
    <v-row>
      <slot />
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>
