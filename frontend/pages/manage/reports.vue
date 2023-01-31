<template>
  <v-container>
    <v-row dense class="d-flex justify-center">
      <v-col cols=12 md=6 lg=4>
        <div class="pb-2 text-h5">
          Current inventory report
        </div>
        <div class="pb-4 text--secondary">
          This report contains all glasses in the inventory of the current location. Dispensed glasses are not included.
        </div>
        <v-btn
          color="accent"
          :loading="loadingInventoryReport"
          @click="downloadInventoryReport"
        >
          Download
        </v-btn>

        <v-divider class="my-9" />

        <div class="pb-2 text-h5">
          Dispense report
        </div>
        <div class="pb-2 text--secondary">
          This report contains all glasses that were dispensed in the selected year.
        </div>

        <v-select
          v-model="selectedDispenedYear"
          :prepend-icon="mdiCalendar"
          :items="lastYears"
          outlined
          class="pt-4"
        />

        <v-btn
          color="accent"
          :loading="loadingDispensedReport"
          @click="downloadDispensedReport"
        >
          Download
        </v-btn>
        <a
          ref="downloadLink"
          :href="csvUri"
          target="_blank"
          :download='filename'
          class="d-none"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mdiCalendar } from '@mdi/js'
import { mapActions, mapState } from 'vuex'
import { locationNames } from '../../lib/util'
export default {
  data: () => ({
    mdiCalendar,
    loadingDispensedReport: false,
    loadingInventoryReport: false,
    csvUri: '',
    filename: '',
    locationNames,
    selectedDispenedYear: null
  }),
  title: 'Create reports',
  computed: {
    ...mapState(['location']),
    lastYears() {
      const year = this.$dayjs().year()
      return Array.from(new Array(30), (_, index) => year - index).filter(year => year >= 2022)
    }
  },
  created() {
    this.selectedDispenedYear = this.$dayjs().year()
  },
  methods: {
    ...mapActions({
      loadDispensedCsv: 'glasses/loadDispensedCsv',
      loadInventoryCsv: 'glasses/loadInventoryCsv'
    }),
    async downloadDispensedReport() {
      this.loadingDispensedReport = true
      const selectedYearStart = this.$dayjs().startOf('year').year(this.selectedDispenedYear)
      try {
        const csvFile = await this.loadDispensedCsv({
          startDate: selectedYearStart.format('MM/DD/YYYY'),
          endDate: selectedYearStart.add(1, 'year').format('MM/DD/YYYY')
        })
        this.filename = `dispense_report_${this.location}_${this.selectedDispenedYear}.csv`
        this.downloadCsv(csvFile)
      } catch (error) {
        this.$store.commit('setError', `Could not create dispense report (Error ${error.status})`)
      }
      this.loadingDispensedReport = false
    },
    async downloadInventoryReport() {
      this.loadingInventoryReport = true
      try {
        const csvFile = await this.loadInventoryCsv()
        this.filename = `inventory_${this.location}.csv`
        this.downloadCsv(csvFile)
      } catch (error) {
        this.$store.commit('setError', `Could not create inventory report (Error ${error.status})`)
      }
      this.loadingInventoryReport = false
    },
    downloadCsv(csvBlob) {
      if (!csvBlob || csvBlob.size === 0) {
        this.$store.commit('setError', 'Report is empty. Try selecting another year?')
        return
      }
      const blob = new Blob([csvBlob], { type: 'application/csv' })
      this.csvUri = URL.createObjectURL(blob)
      this.$nextTick(() => {
        this.$refs.downloadLink.click()
      })
    }
  }
}
</script>
