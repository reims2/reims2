<template>
  <v-app dark>
    <v-main>
      <nuxt keep-alive />
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
