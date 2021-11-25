<template>
  <v-footer
    app
    dark
    color="primary"
    elevation=4
    class="justify-center text-body-2 pa-1"
    padless
  >
    <div v-if="showLastUpdate">
      <last-refresh-span /><span class="px-2">—</span>
    </div>
    <span>&copy; {{ new Date().getFullYear() }}
      <a href="https://partnersforvisualhealth.org/" tabindex="-1" target=”_blank” rel=noopener class="white--text">Partners for Visual Health</a>
    </span>
    <span class="px-2">—</span>
    <a href="https://github.com/reims2" tabindex="-1" target=”_blank” rel=noopener class="white--text">Source Code</a>
  </v-footer>
</template>

<script>
export default {
  props: {
    showLastUpdate: {
      type: Boolean,
      default: true
    }
  }
}
</script>
