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
                  to="/find"
                  nuxt
                  color="primary"
                  rounded
                >
                  Open current version of REIMS
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
