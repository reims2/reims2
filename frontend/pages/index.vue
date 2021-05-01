<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="8">
      <v-card>
        <v-card-title class="headline">
          Welcome to REIMS2
        </v-card-title>
        <v-card-text>
          <v-container class="pt-10">
            <v-row>
              <v-col cols=12>
                <v-alert
                  border="left"
                  colored-border
                  type="warning"
                  elevation="2"
                >
                  In its current state the UI has no real functions. The displayed data is the example data from 1998-2000.
                </v-alert>
              </v-col>
              <v-col class="d-flex justify-center">
                <v-btn
                  to="/onsite/find"
                  nuxt
                  color="primary"
                  rounded
                  class="mr-4"
                >
                  REIMS on-site app
                </v-btn>
                <v-btn
                  to="/manage/add"
                  nuxt
                  color="primary"
                  rounded
                >
                  REIMS inventory management
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  layout: 'start'
}
</script>
