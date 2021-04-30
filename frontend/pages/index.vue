<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="8">
      <v-card>
        <v-card-title class="headline">
          Welcome to REIMS2
        </v-card-title>
        <v-card-text class="text-center">
          <v-btn
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            nuxt
            class="ma-2"
          >
            <v-icon>{{ item.icon }}</v-icon>
            {{ item.text }}
          </v-btn>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mdiFileFindOutline, mdiPlusBox, mdiDatabaseOutline } from '@mdi/js';
export default {
  layout: 'start',
  data () {
    return {
      items: [
        {
          text: 'Find glasses',
          to: 'find',
          icon: mdiFileFindOutline
        },
        {
          text: 'Add glasses',
          to: 'add',
          icon: mdiPlusBox
        },
        {
          text: 'View data',
          to: 'data',
          icon: mdiDatabaseOutline
        }
      ]
    }
  }
}
</script>
