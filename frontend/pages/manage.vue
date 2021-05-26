<template>
  <v-container fluid>
    <app-header :items="items" title="Inventory management" />
    <NuxtChild keep-alive />
  </v-container>
</template>

<script>
import AppHeader from '~/components/AppHeader.vue'

export default {
  components: { AppHeader },
  data() {
    return {
      items: [
        {
          text: 'Add glasses',
          to: 'add'
        },
        {
          text: 'Edit glasses',
          to: 'edit'
        },
        {
          text: 'View data',
          to: 'data'
        },
        {
          text: 'Generate reports',
          to: 'reports'
        }
      ]
    }
  },
  head() {
    return {
      title: 'Inventory management'
    }
  }
}
</script>
