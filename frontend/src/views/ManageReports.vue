<template>
  <page-layout title="Reports">
    <v-col cols="12" md="6">
      <v-card
        border
        elevation="1"
        class="pa-3 h-100 d-flex flex-column"
        title="Statistics dashboard"
        text="Visit the dashboard to see live statistics."
      >
        <v-spacer />
        <v-card-actions class="px-4 pb-4">
          <v-btn
            color="primary"
            variant="tonal"
            :append-icon="mdiOpenInNew"
            href="https://monitoring.reims2.app"
            target="_blank"
          >
            Open dashboard
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col v-for="report in reports" :key="report.file" cols="12" md="6">
      <v-card
        border
        elevation="1"
        class="pa-3 h-100 d-flex flex-column"
        :title="report.title"
        :text="report.text"
      >
        <v-spacer />
        <v-card-actions class="px-4 pb-4">
          <v-btn
            color="primary"
            variant="tonal"
            :prepend-icon="mdiDownload"
            :loading="report.loading"
            @click="download(report)"
          >
            Download
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>

    <a ref="downloadLink" :href="csvUri" target="_blank" :download="filename" class="d-none" />
  </page-layout>
</template>

<script setup lang="ts">
import PageLayout from '@/components/PageLayout.vue'
import { mdiDownload, mdiOpenInNew } from '@mdi/js'
import { useRootStore } from '@/stores/root'
import { useGlassesStore } from '@/stores/glasses'

import { useToast } from '@/composables/toast'
const toast = useToast()

const glassesStore = useGlassesStore()
const rootStore = useRootStore()
const csvUri = ref('')
const filename = ref('')
const downloadLink = useTemplateRef('downloadLink')

const reports = reactive([
  {
    title: 'Current inventory report',
    text: 'This report contains all glasses in the storage of the current location.',
    file: 'inventory',
    load: glassesStore.loadInventoryCsv,
    loading: false,
  },
  {
    title: 'Dispense & delete report',
    text: 'This report contains all glasses that were dispensed and deleted.',
    file: 'dispense_report',
    load: glassesStore.loadDispensedCsv,
    loading: false,
  },
  {
    title: 'Unsuccessful searches report',
    text: 'This report contains all searches that returned no results.',
    file: 'unsuccessful_searches',
    load: glassesStore.loadSearchesCsv,
    loading: false,
  },
])

async function download(report: (typeof reports)[number]) {
  report.loading = true
  try {
    const csvFile = await report.load()
    filename.value = `${report.file}_${rootStore.reimsSite}.csv`
    downloadCsv(csvFile)
  } catch (error) {
    toast.error(`Could not load the ${report.title.toLowerCase()} (${(error as Error).message})`)
  } finally {
    report.loading = false
  }
}

async function downloadCsv(csvBlob: Blob) {
  if (!csvBlob || csvBlob.size === 0) {
    toast.warning('Report contains no glasses.')
    return
  }
  const blob = new Blob([csvBlob], { type: 'text/csv' })
  if (csvUri.value) URL.revokeObjectURL(csvUri.value)
  csvUri.value = URL.createObjectURL(blob)
  await nextTick()
  downloadLink.value?.click()
}
</script>
