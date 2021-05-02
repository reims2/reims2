<template>
  <v-container fluid @keyup.alt.67="console.log('hi')">
    <app-header :items="items" />
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
          text: 'Find glasses',
          to: 'find'
        },
        {
          text: 'Dispense glasses',
          to: 'dispense'
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
      title: 'On-site'
    }
  }
}
</script>
