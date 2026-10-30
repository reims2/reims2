<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container fluid class="px-lg-10">
    <v-data-table
      v-model:items-per-page="itemsPerPage"
      v-model:sort-by="sortBy"
      v-model:page="page"
      :headers="headers"
      :items="formattedItems"
      density="compact"
      must-sort
      :items-per-page-options="itemsPerPageOptions"
    >
      <template #thead>
        <tr>
          <td />
          <td>
            <v-select
              v-model="glassesTypeFilter"
              single-line
              multiple
              density="compact"
              variant="underlined"
              hide-details
              label="Filter"
              :items="['single', 'multifocal']"
              style="min-width: 70px"
              class="pb-1 px-2"
            />
          </td>
          <td>
            <min-max-input v-model="eyeFilters.od.sphere" />
          </td>
          <td>
            <min-max-input v-model="eyeFilters.od.cylinder" />
          </td>
          <td />
          <td />
          <td>
            <min-max-input v-model="eyeFilters.os.sphere" />
          </td>
          <td>
            <min-max-input v-model="eyeFilters.os.cylinder" />
          </td>
        </tr>
      </template>

      <template #item.actions="{ item }">
        <v-btn
          :to="{ name: 'Edit', query: { sku: Number(item.sku) } }"
          icon
          size="x-small"
          :aria-label="`Edit SKU ${item.sku}`"
        >
          <v-icon>{{ mdiPencil }}</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-btn class="mr-4" variant="plain" tabindex="-1" @click="reset">Reset table</v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { mdiPencil } from '@mdi/js'
import dayjs from 'dayjs'
import MinMaxInput from '@/components/MinMaxInput.vue'
import { useTableFilter } from '@/composables/table-filter'
import { TableSortBy } from '@/model/ReimsModel'
import { useGlassesStore } from '@/stores/glasses'
import { formatGlassesForDisplay } from '@/util/format-glasses'

const headers = [
  { key: 'sku', title: 'SKU' },
  { key: 'glassesType', title: 'Type' },
  { key: 'od.sphere', title: 'OD SPH' },
  { key: 'od.cylinder', title: 'OD CYL' },
  { key: 'od.axis', title: 'OD Axis' },
  { key: 'od.add', title: 'OD Add' },
  { key: 'os.sphere', title: 'OS SPH' },
  { key: 'os.cylinder', title: 'OS CYL' },
  { key: 'os.axis', title: 'OS Axis' },
  { key: 'os.add', title: 'OS Add' },
  { key: 'appearance', title: 'Appearance' },
  { key: 'glassesSize', title: 'Size' },
  {
    key: 'creationDate',
    title: 'Added',
    // the API sends ISO strings despite the number type
    sortRaw: (a: TableItem, b: TableItem) =>
      dayjs(a.glasses.creationDate).diff(b.glasses.creationDate),
  },
  { key: 'actions', title: '', sortable: false },
]

const itemsPerPageOptions = [
  { value: 10, title: '10' },
  { value: 20, title: '20' },
  { value: 50, title: '50' },
  { value: 100, title: '100' },
  { value: 250, title: '250' },
]

const page = ref(1)
const itemsPerPage = ref(20)
const sortBy = ref<TableSortBy[]>([{ key: 'sku', order: 'asc' }])

const glassesTypeFilter = ref<string[]>([])

const glassesStore = useGlassesStore()
const { filteredGlasses, resetFilters, eyeFilters } = useTableFilter(
  () => glassesStore.allGlasses,
  glassesTypeFilter,
)

// keep the raw glasses so the formatted date column can sort chronologically
const formattedItems = computed(() =>
  filteredGlasses.value.map((glasses) => ({ ...formatGlassesForDisplay(glasses), glasses })),
)
type TableItem = (typeof formattedItems.value)[number]

function reset() {
  sortBy.value = [{ key: 'sku', order: 'asc' }]
  page.value = 1
  itemsPerPage.value = 20
  glassesTypeFilter.value = []
  resetFilters()
}
</script>
