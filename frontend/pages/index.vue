<template>
  <v-container fluid class="ma-0 pa-0 hero-bg" style="width:100%; height:100%">
    <v-overlay opacity="0.95" absolute class="pa-0 ma-0">
      <v-row justify="center" align="center" dense>
        <v-col class="text-center white--text">
          <h1 class="text-h3 pb-8 pb-md-14 px-4">
            Richmond Eyeglass Inventory Matching System
          </h1>
          <v-container>
            <v-row class="justify-center">
              <v-col class="col-auto">
                <v-btn
                  to="/onsite/find"
                  nuxt
                  x-large
                  color="primary"
                >
                  Open REIMS2
                </v-btn>
              </v-col>
              <v-col class="col-auto" cols=12 md="auto">
                <v-btn
                  x-large
                  outlined
                >
                  <v-icon left size="24">
                    {{ mdiFileDocument }}
                  </v-icon>
                  View Manual
                </v-btn>
              </v-col>
              <v-col class="col-auto" cols=12 md="auto">
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
          </v-container>
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
