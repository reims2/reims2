<template>
  <v-container>
    <app-header :items="items" title="REIMS2" />
    <v-container>
      <NuxtChild keep-alive />
    </v-container>
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
          text: 'More to come',
          to: '/error'
        }
      ]
    }
  },
  head() {
    return {
      title: 'On-site'
    };
  }
}
</script>
