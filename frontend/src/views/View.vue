<template>
  <v-container fluid class="px-lg-10">
    <v-row dense class="d-flex justify-center px-0">
      <v-col cols="12" class="px-0">
        <glasses-table />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import GlassesTable from '@/components/GlassesTable.vue'
export default {
  components: {
    GlassesTable,
  },
  transition: 'main',
  title: 'View all glasses',
  head() {
    return {
      title: 'View all glasses',
    }
  },
}
</script>
