<template>
  <v-container>
    <v-row dense class="d-flex justify-center">
      <v-col cols=12 md=6 lg=4>
        <div class="pb-2 text-h5">
          Export current inventory
        </div>
        <div class="pb-4 text--secondary">
          Click this button to export a report of all glasses that are not dispensed.
        </div>
        <v-btn
          color="accent"
          :loading="loadingUndispensed"
          @click="downloadUndispensed"
        >
          Export all
        </v-btn>

        <v-divider class="my-8" />

        <div class="pb-2 text-h5">
          Export dispensed glasses
        </div>
        <div class="pb-2 text--secondary">
          Select a date range and click the buttom below to generate a report of all dispensed glasses during that time.
        </div>
        <div class="pt-4">
          <v-menu
            v-model="startMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                :value="startDate"
                label="From"
                :prepend-icon="mdiCalendar"
                readonly
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="startDate"
              no-title
              scrollable
              @input="startMenu = false"
            />
          </v-menu>
        </div>
        <div class="pb-2">
          <v-menu
            v-model="endMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                :value="endDate"
                label="To"
                :prepend-icon="mdiCalendar"
                readonly
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="endDate"
              no-title
              scrollable
              @input="endMenu = false"
            />
          </v-menu>
        </div>

        <v-btn
          color="accent"
          :loading="loadingDispensed"
          @click="downloadDispensed"
        >
          Export dispensed
        </v-btn>
        <a
          ref="downloadLink"
          :href="csvUri"
          target="_blank"
          download='glasses.csv'
          class="d-none"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mdiCalendar } from '@mdi/js'
import { mapActions } from 'vuex'
export default {
  data: () => ({
    startDate: '',
    endDate: '',
    startMenu: false,
    endMenu: false,
    mdiCalendar,
    loadingDispensed: false,
    loadingUndispensed: false,
    csvUri: ''
  }),
  title: 'Create reports',
  created() {
    this.startDate = this.$dayjs().subtract(1, 'year').format('YYYY-MM-DD')
    this.endDate = this.$dayjs().format('YYYY-MM-DD')
  },
  methods: {
    ...mapActions({
      loadDispensed: 'glasses/loadDispensedCsv',
      loadUndispensed: 'glasses/loadUndispensedCsv'
    }),
    async downloadDispensed() {
      this.loadingDispensed = true
      try {
        const csvFile = await this.loadDispensed({
          startDate: this.$dayjs(this.startDate).format('MM/DD/YYYY'),
          endDate: this.$dayjs(this.endDate).add(1, 'day').format('MM/DD/YYYY')
        })
        this.downloadCsv(csvFile)
      } catch (error) {
        this.$store.commit('setError', `Could not load dispensed report (Error ${error.status})`)
      }
      this.loadingDispensed = false
    },
    async downloadUndispensed() {
      this.loadingUndispensed = true
      try {
        const csvFile = await this.loadUndispensed()
        this.downloadCsv(csvFile)
      } catch (error) {
        this.$store.commit('setError', `Could not load all glasses (Error ${error.status})`)
      }
      this.loadingUndispensed = false
    },
    downloadCsv(csvBlob) {
      const blob = new Blob([csvBlob], { type: 'application/csv' })
      this.csvUri = URL.createObjectURL(blob)
      this.$nextTick(() => {
        this.$refs.downloadLink.click()
      })
    }
  }
}
</script>
