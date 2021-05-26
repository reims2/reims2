<template>
  <v-container fluid @keyup.alt.67="console.log('hi')">
    <app-header :items="items" />
    <NuxtChild keep-alive />
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
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
          text: 'View all glasses',
          to: 'data'
        }
      ]
    }
  },
  head() {
    return {
      title: 'On-site'
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    ...mapActions({
      load: 'glasses/loadActiveGlasses'
    })
  }
}
</script>
