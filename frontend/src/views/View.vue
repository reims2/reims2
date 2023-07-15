<template>
  <v-container fluid class="px-lg-10">
    <v-row dense class="d-flex justify-center px-0">
      <v-col cols="12" class="px-0">
        <glasses-table />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import GlassesTable from '@/components/GlassesTable.vue'
import { useHead } from '@unhead/vue'

useHead({
  title: 'View Glasses',
})
</script>
