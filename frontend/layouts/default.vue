<template>
  <v-app dark>
    <v-main>
      <nuxt />
    </v-main>
    <v-footer
      app
      dark
      color="primary"
      elevation=4
      class="justify-center text-body-2 pa-1"
      padless
    >
      <span>&copy; {{ new Date().getFullYear() }}
        <a href="https://partnersforvisualhealth.org/" target=”_blank” rel=noopener class="white--text">Partners for Visual Health</a>
      </span>
      <span class="px-2">—</span>
      <a href="https://github.com/reims2" target=”_blank” rel=noopener class="white--text">Source Code</a>
    </v-footer>
  </v-app>
</template>
