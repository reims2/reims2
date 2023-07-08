<template>
  <v-container>
    <v-row dense class="d-flex justify-center">
      <v-col cols=12 md=6 lg=4>
        <div class="pb-2 text-h5">
          Live statistics
        </div>
        <div class="pb-4 text--secondary">
          Visit the monitoring dashboard to see live statistics.
        </div>
        <v-btn
          color="accent"
          href="https://monitoring.reims2.app"
          target="_blank"
        >
          Open dashboard
        </v-btn>

        <v-divider class="my-9" />

        <div class="pb-2 text-h5">
          Current inventory report
        </div>
        <div class="pb-4 text--secondary">
          This report contains all active glasses in the storage of the current location.
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
          Dispense & delete report
        </div>
        <div class="pb-2 text--secondary">
          This report contains all glasses that were dispensed or deleted in the selected year.
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
import { mapState } from 'pinia'
import { useRootStore } from '@/stores/root'
import { useGlassesStore } from '@/stores/glasses'
import { locationNames } from '../../lib/util'
export default {
  inject: ['dayjs'],
  setup() {
    const glassesStore = useGlassesStore()
    return { glassesStore }
  },
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
  head() {
    return {
      title: 'Create reports'
    }
  },
  computed: {
    ...mapState(useRootStore, ['location']),
    lastYears() {
      const year = this.dayjs().year()
      return Array.from(new Array(30), (_, index) => year - index).filter(year => year >= 2022)
    }
  },
  created() {
    this.selectedDispenedYear = this.dayjs().year()
  },
  methods: {
    async downloadDispensedReport() {
      this.loadingDispensedReport = true
      const selectedYearStart = this.dayjs().startOf('year').year(this.selectedDispenedYear)
      try {
        const csvFile = await this.glassesStore.loadDispensedCsv({
          startDate: selectedYearStart.format('MM/DD/YYYY'),
          endDate: selectedYearStart.add(1, 'year').format('MM/DD/YYYY')
        })
        this.filename = `dispense_report_${this.location}_${this.selectedDispenedYear}.csv`
        this.downloadCsv(csvFile)
      } catch (error) {
        this.rootStore.setError(`Could not create dispense report (Error ${error.status})`)
      }
      this.loadingDispensedReport = false
    },
    async downloadInventoryReport() {
      this.loadingInventoryReport = true
      try {
        const csvFile = await this.glassesStore.loadInventoryCsv()
        this.filename = `inventory_${this.location}.csv`
        this.downloadCsv(csvFile)
      } catch (error) {
        this.rootStore.setError(`Could not create inventory report (Error ${error.status})`)
      }
      this.loadingInventoryReport = false
    },
    downloadCsv(csvBlob) {
      if (!csvBlob || csvBlob.size === 0) {
        this.rootStore.setError('Report is empty. Try selecting another year?')
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
