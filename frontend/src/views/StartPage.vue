<template>
  <div class="pa-0 ma-0 hero-bg opaque" style="height: 100%; width: 100%">
    <div style="height: 100%" class="opaque d-flex justify-center align-center">
      <v-container>
        <v-row class="px-3">
          <v-col class="pb-3 text-center text-white" cols="12">
            <h1 class="text-h2 font-weight-normal">REIMS2</h1>
          </v-col>
          <v-col class="pb-6 text-center d-flex justify-center text-white" cols="12">
            <p class="text-subtitle-1 text-md-h6" style="max-width: 600px">
              REIMS2 is the next version of the Richmond Eyeglass Inventory Matching System. It
              supports the annual visual health campaigns run by non-profit
              <a href="https://partnersforvisualhealth.org/" target="”_blank”" class="text-white">
                Partners for Visual Health
              </a>
              .
            </p>
          </v-col>
          <v-col cols="12">
            <v-row class="justify-center align-center">
              <v-col class="d-flex justify-center" cols="12" sm="auto">
                <v-btn to="/find" size="x-large" color="primary">Open REIMS2</v-btn>
              </v-col>
              <v-col class="d-flex justify-center" cols="12" sm="auto">
                <v-btn
                  href="/docs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="x-large"
                  large
                  variant="outlined"
                  color="white"
                >
                  <v-icon left size="24">
                    {{ mdiFileDocument }}
                  </v-icon>
                  View Manual
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiFileDocument } from '@mdi/js'
</script>

<style lang="scss" scoped>
.hero-bg {
  background: url('@/assets/img/pfvh-hero.jpg');
  background-size: cover;
  background-position: left;
  background-repeat: no-repeat;
}
.opaque {
  opacity: 0.97;
  background-color: rgb(33, 33, 33);
}
</style>
