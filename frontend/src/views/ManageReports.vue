<template>
  <v-container>
    <v-row dense class="d-flex justify-center">
      <v-col cols="12" md="6" lg="4">
        <div class="pb-2 text-h5">Live statistics</div>
        <div class="pb-4 text-medium-emphasis">
          Visit the monitoring dashboard to see live statistics.
        </div>
        <v-btn color="accent" href="https://monitoring.reims2.app" target="_blank">
          Open dashboard
        </v-btn>

        <v-divider class="my-9" />

        <div class="pb-2 text-h5">Current inventory report</div>
        <div class="pb-4 text-medium-emphasis">
          This report contains all active glasses in the storage of the current location.
        </div>
        <v-btn color="accent" :loading="loadingInventoryReport" @click="downloadInventoryReport">
          Download
        </v-btn>

        <v-divider class="my-9" />

        <div class="pb-2 text-h5">Unsucessful searches report</div>
        <div class="pb-4 text-medium-emphasis">This TODO</div>
        <v-btn color="accent" :loading="loadingSearchesReport" @click="downloadSearchesReport">
          Download
        </v-btn>

        <v-divider class="my-9" />

        <div class="pb-2 text-h5">Dispense & delete report</div>
        <div class="pb-2 text-medium-emphasis">
          This report contains all glasses that were dispensed or deleted.
        </div>

        <v-btn color="accent" :loading="loadingDispensedReport" @click="downloadDispensedReport">
          Download
        </v-btn>
        <a ref="downloadLink" :href="csvUri" target="_blank" :download="filename" class="d-none" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRootStore } from '@/stores/root'
import { useGlassesStore } from '@/stores/glasses'

import { useToast } from 'vue-toastification'
const toast = useToast()

const glassesStore = useGlassesStore()
const rootStore = useRootStore()
const loadingSearchesReport = ref(false)
const loadingDispensedReport = ref(false)
const loadingInventoryReport = ref(false)
const csvUri = ref('')
const filename = ref('')
const downloadLink = useTemplateRef('downloadLink')

async function downloadDispensedReport() {
  loadingDispensedReport.value = true
  try {
    const csvFile = await glassesStore.loadDispensedCsv()
    filename.value = `dispense_report_${rootStore.reimsSite}.csv`
    downloadCsv(csvFile)
  } catch (error) {
    toast.error(`Could not load dispense report (${error.message})`)
  }
  loadingDispensedReport.value = false
}

async function downloadSearchesReport() {
  loadingSearchesReport.value = true
  try {
    const csvFile = await glassesStore.loadSearchesCsv()
    filename.value = `unsuccessful_searches_${rootStore.reimsSite}.csv`
    downloadCsv(csvFile)
  } catch (error) {
    toast.error(`Could not load dispense report (${error.message})`)
  }
  loadingSearchesReport.value = false
}

async function downloadInventoryReport() {
  loadingInventoryReport.value = true
  try {
    const csvFile = await glassesStore.loadInventoryCsv()
    filename.value = `inventory_${rootStore.reimsSite}.csv`
    downloadCsv(csvFile)
  } catch (error) {
    toast.error(`Could not load inventory report (${error.message})`)
  }
  loadingInventoryReport.value = false
}

async function downloadCsv(csvBlob: Blob) {
  if (!csvBlob || csvBlob.size === 0) {
    toast.warning('Report is empty. Try selecting another year?')
    return
  }
  const blob = new Blob([csvBlob], { type: 'application/csv' })
  csvUri.value = URL.createObjectURL(blob)
  await nextTick()
  downloadLink.value?.click()
}
</script>
