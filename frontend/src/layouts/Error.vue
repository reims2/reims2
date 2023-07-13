<template>
  <v-app dark>
    <app-header />
    <v-container class="ma-4">
      <h1 v-if="error.statusCode === 404">
        {{ pageNotFound }}
      </h1>
      <h1 v-else>
        {{ otherError }}
      </h1>
      <router-link to="/">Home page</router-link>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  error: {
    type: Object,
    default: null,
  },
})

const pageNotFound = 'Page not found'
const otherError = 'An error occurred'

const title = computed(() => (props.error.statusCode === 404 ? pageNotFound : otherError))

//todo useHead({ title, })
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
