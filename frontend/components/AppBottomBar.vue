<template>
  <v-bottom-navigation
    v-model="value"
    app
    background-color="primary"
    dark
    grow
  >
    <v-btn v-for="item in items" :key="item.to" :to="item.to" nuxt>
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
