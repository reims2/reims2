<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">
          Welcome to REIMS2
        </v-card-title>
        <v-card-text>
          <v-btn
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            nuxt
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
import { mdiFileFindOutline, mdiPlusBox, mdiChartBoxOutline } from '@mdi/js';
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
          text: 'Enter glasses',
          to: 'enter',
          icon: mdiPlusBox
        },
        {
          text: 'Generate reports',
          to: 'reports',
          icon: mdiChartBoxOutline
        }
      ]
    }
  }
}
</script>
