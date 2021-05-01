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
          text: 'View data',
          to: 'data'
        },
        {
          text: 'More to come',
          to: '/error'
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
