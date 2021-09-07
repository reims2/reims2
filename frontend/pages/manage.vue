<template>
  <v-container fluid>
    <NuxtChild keep-alive />
  </v-container>
</template>

<script>

export default {
  head() {
    return {
      title: 'Inventory management'
    }
  }
}
</script>
