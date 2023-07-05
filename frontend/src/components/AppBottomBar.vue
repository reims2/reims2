<template>
  <v-bottom-navigation
    app
    color="accent"
    light
    grow
  >
    <v-btn v-for="item in items" :key="item.to" :to="item.to" :disabled="item.disabled || false" nuxt>
      <span>{{ item.title }}</span>
      <v-icon>{{ item.icon }}</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true
    }
  }
}
</script>
