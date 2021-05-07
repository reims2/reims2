<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="8">
      <v-card class="ma-4">
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
                  The UI is a work in progress and is still lacking many features.
                </v-alert>
              </v-col>
              <v-col class="d-flex justify-center">
                <v-btn
                  to="/onsite/find"
                  nuxt
                  color="primary"
                  class="mr-4"
                >
                  On-site app
                </v-btn>
              </v-col>
              <v-col class="d-flex justify-center">
                <v-btn
                  to="/manage/add"
                  nuxt
                  color="primary"
                >
                  Inventory management
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
  head() {
    return {
      title: 'Start'
    }
  },
  auth: false
}
</script>
