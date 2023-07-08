<template>
  <v-app>
    <v-main>
      <router-view/>
    </v-main>
    <app-footer
      :show-last-update=false
    />
  </v-app>
</template>

<script>
import AppFooter from '@/components/AppFooter.vue'
export default {
  components: { AppFooter }
}
</script>
