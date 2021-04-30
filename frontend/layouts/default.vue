<template>
  <v-app dark>
    <v-app-bar
      hide-on-scroll
      app
      dark
      color="indigo"
    >
      <v-spacer />
      <v-toolbar-title class="text-h5">
        <nuxt-link to="/" style="text-decoration: none; color: white;">
          {{ $vuetify.breakpoint.mobile ? "REIMS" : "Richmond Eyeglass Inventory Matching System" }}
        </nuxt-link>
      </v-toolbar-title>
      <v-spacer />
      <template #extension>
        <v-tabs
          fixed-tabs
          centered
          show-arrows
        >
          <v-tab
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            nuxt
          >
            {{ item.text }}
          </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <v-main>
      <nuxt />
    </v-main>
    <v-footer
      app
      dark
      color="indigo"
      elevation=4
      class="justify-center"
    >
      <span>&copy; {{ new Date().getFullYear() }} Partners for Visual Health</span>
      <span class="px-2">—</span>
      <a href="https://github.com/friends-of-asaprosar" target=”_blank” rel=noopener class="white--text">Source Code</a>
    </v-footer>
  </v-app>
</template>

<script>

export default {
  data () {
    return {
      items: [
        {
          text: 'Find glasses',
          to: 'find'
        },
        {
          text: 'Add glasses',
          to: 'add'
        },
        {
          text: 'View data',
          to: 'data'
        }
      ]
    }
  }
}
</script>
