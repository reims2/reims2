<template>
  <v-container>
    <v-row dense class="d-flex justify-center">
      <v-col cols=12 md=6 lg=4>
        <div class="pb-2">
          Select a date range below to generate a table of all dispensed glasses during that time.
        </div>
        <div class="py-4">
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            :return-value.sync="date"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                :value="'From ' + date[0] + ' to ' + date[1]"
                label="Date range"
                :prepend-icon="mdiCalendar"
                readonly
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="date"
              no-title
              scrollable
              range
            >
              <v-spacer />
              <v-btn
                text
                color="primary"
                @click="menu = false"
              >
                Cancel
              </v-btn>
              <v-btn
                text
                color="primary"
                @click="$refs.menu.save(date)"
              >
                OK
              </v-btn>
            </v-date-picker>
          </v-menu>
        </div>
        <v-btn
          color="primary"
          :loading="loading"
          @click="submit"
        >
          Download reports
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mdiCalendar } from '@mdi/js'
export default {
  data: () => ({
    date: [],
    menu: false,
    mdiCalendar,
    loading: false
  }),
  created() {
    this.date = [this.$dayjs().subtract(1, 'year').format('YYYY-MM-DD'), this.$dayjs().format('YYYY-MM-DD')]
  },
  methods: {
    submit() {
      this.$store.commit('setError', 'This is not implemented yet!')
    }
  }
}
</script>
