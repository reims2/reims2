<template>
  <v-container fluid class="ma-0 pa-0 hero-bg" style="width:100%; height:100%">
    <v-overlay opacity="0.95" absolute class="pa-0 ma-0">
      <v-row class="px-3" justify="center" align="center">
        <v-col class="text-center" cols=12>
          <h1 class="text-h2 pb-5">
            REIMS2.app
          </h1>
        </v-col>
        <v-col class="pb-6 text-center d-flex justify-center" cols=12>
          <p class="text-subtitle-1 text-md-h6" style="max-width: 600px;">
            REIMS2 is the next version of the Richmond Eyeglass Inventory Matching System.
            It supports the non-profit visual health campaigns run by
            <a href="https://partnersforvisualhealth.org/" tabindex="-1" target=”_blank” rel=noopener class="white--text">Partners for Visual Health</a>.
          </p>
        </v-col>
        <v-col cols=12>
          <v-row class="justify-center align-center">
            <v-col class="d-flex justify-center" cols=12 md="auto">
              <v-btn
                to="/onsite/find"
                nuxt
                x-large
                color="primary"
              >
                Open REIMS2
              </v-btn>
            </v-col>
            <v-col class="d-flex justify-center" cols=12 md="auto">
              <v-btn
                href="/docs"
                x-large
                outlined
              >
                <v-icon left size="24">
                  {{ mdiFileDocument }}
                </v-icon>
                View Manual
              </v-btn>
            </v-col>
            <v-col class="d-flex justify-center" cols=12 md="auto">
              <v-btn
                to="/manage/add"
                nuxt
                x-large
                outlined
              >
                <v-icon left size="24">
                  {{ mdiDatabaseCog }}
                </v-icon>
                Manage inventory
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-overlay>
  </v-container>
</template>

<script>
import { mdiDatabaseCog, mdiGlasses, mdiFileDocument } from '@mdi/js'
export default {
  transition: '',
  data: () => ({
    mdiDatabaseCog,
    mdiGlasses,
    mdiFileDocument
  }),
  head() {
    return {
      title: 'Start'
    }
  },
  auth: false
}
</script>

<style lang="scss" scoped>
.hero-bg {
  background: url('/img/pfvh-hero.jpg');
  background-size: cover
}
</style>
