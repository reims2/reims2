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
        {{ $vuetify.breakpoint.mobile ? "REIMS" : "Richmond Eyeglass Inventory Matching System" }}
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
      <v-container style="max-width: 800px;">
        <nuxt />
      </v-container>
    </v-main>
    <v-footer
      app
      dark
      color="indigo"
      elevation=4
    >
      <span>&copy; {{ new Date().getFullYear() }} Partners for Visual Health</span>
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
          text: 'Enter glasses',
          to: 'enter'
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
