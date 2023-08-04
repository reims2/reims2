<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    v-model:sort-by="sortBy"
    v-model:page="page"
    :headers="headers"
    :items="formattedItems"
    :items-length="totalItems"
    :loading="loading"
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
            small-chips
            label="Filter"
            :items="['single', 'multifocal']"
            style="min-width: 70px"
            class="pb-1 px-2"
          />
        </td>
        <td>
          <min-max-input
            @update:model-value="(value: any) => updateEyeFilter(value, 'od', 'sphere')"
          />
        </td>
        <td>
          <min-max-input
            @update:model-value="(value: any) => updateEyeFilter(value, 'od', 'cylinder')"
          />
        </td>
        <td />
        <td />
        <td>
          <min-max-input
            @update:model-value="(value: any) => updateEyeFilter(value, 'os', 'sphere')"
          />
        </td>
        <td>
          <min-max-input
            @update:model-value="(value: any) => updateEyeFilter(value, 'os', 'cylinder')"
          />
        </td>
      </tr>
    </template>

    <template #item.actions="{ item }">
      <v-btn :to="{ name: 'Edit', query: { sku: Number(item.columns.sku) } }" icon size="x-small">
        <v-icon>{{ mdiPencil }}</v-icon>
      </v-btn>
    </template>
  </v-data-table-server>

  <v-btn class="mr-4" variant="plain" tabindex="-1" @click="reset">Reset table</v-btn>
</template>

<script setup lang="ts">
import { mdiPencil } from '@mdi/js'
import MinMaxInput from '@/components/MinMaxInput.vue'
import { useTableData } from '@/lib/table-data'
import { useTableFilter } from '@/lib/table-filter'
import { TableSortBy } from '@/model/ReimsModel'

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
  { key: 'creationDate', title: 'Added' },
  { key: 'actions', title: '', sortable: false },
]

const itemsPerPageOptions = [
  { value: 10, title: '10' },
  { value: 25, title: '20' },
  { value: 50, title: '50' },
  { value: 100, title: '100' },
  { value: 500, title: '250' },
]

const page = ref(1)
const itemsPerPage = ref(20)
const sortBy = ref<TableSortBy[]>([{ key: 'sku', order: 'asc' }])

const { filterString, glassesTypeFilter, resetFilters, updateEyeFilter } = useTableFilter()

const { formattedItems, totalItems, loading } = useTableData(
  page,
  itemsPerPage,
  sortBy,
  filterString,
)

function reset() {
  sortBy.value = [{ key: 'sku', order: 'asc' }]
  page.value = 1
  itemsPerPage.value = 20
  resetFilters()
}
</script>
