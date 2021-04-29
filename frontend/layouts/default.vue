<template>
  <v-app dark>
    <v-app-bar
      hide-on-scroll
      app
    >
      <v-toolbar-title class="text-center justify-center py-6">
        REIMS2
      </v-toolbar-title>
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
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer
      app
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
          text: 'Generate reports',
          to: 'reports'
        }
      ]
    }
  }
}
</script>
