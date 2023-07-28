<template>
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    v-model:sort-by="sortBy"
    v-model:page="page"
    :headers="headers"
    :items="items"
    :items-length="totalItems"
    :loading="loading"
    density="compact"
    must-sort
    :footer-props="{
      showFirstLastPage: true,
      itemsPerPageOptions: [10, 20, 50, 100, 500],
      showCurrentPage: true,
    }"
    @update:options="startLoading"
  >
    <template #thead>
      <tr>
        <td />
        <td class="v-data-table__divider">
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
          <min-max-input @change="(value: any) => updateEyeFilter(value, 'od', 'sphere')" />
        </td>
        <td>
          <min-max-input @change="(value: any) => updateEyeFilter(value, 'od', 'cylinder')" />
        </td>
        <td />
        <td class="v-data-table__divider" />
        <td>
          <min-max-input @change="(value: any) => updateEyeFilter(value, 'os', 'sphere')" />
        </td>
        <td>
          <min-max-input @change="(value: any) => updateEyeFilter(value, 'os', 'cylinder')" />
        </td>
        <td />
        <td class="v-data-table__divider" />
        <td />
        <td />
        <td />
        <td />
      </tr>
    </template>

    <template #item.od.sphere="{ item }">{{ formatRx(item.columns['od.sphere']) }} D</template>
    <template #item.od.cylinder="{ item }">{{ formatRx(item.columns['od.cylinder']) }} D</template>
    <template #item.od.axis="{ item }">{{ formatAxis(item.columns['od.axis']) }}</template>
    <template #item.od.add="{ item }">{{ formatRx(item.columns['od.add']) }} D</template>
    <template #item.os.sphere="{ item }">{{ formatRx(item.columns['os.sphere']) }} D</template>
    <template #item.os.cylinder="{ item }">{{ formatRx(item.columns['os.cylinder']) }} D</template>
    <template #item.os.axis="{ item }">{{ formatAxis(item.columns['os.axis']) }}</template>
    <template #item.os.add="{ item }">{{ formatRx(item.columns['os.add']) }} D</template>
    <template #item.creationDate="{ item }">{{ formatDate(item.columns.creationDate) }}</template>
    <template #item.actions="{ item }">
      <v-btn :to="{ path: '/edit', query: { sku: item.columns.sku } }" icon size="x-small">
        <v-icon>{{ mdiPencil }}</v-icon>
      </v-btn>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { mdiPencil } from '@mdi/js'
import { useTableStore } from '@/stores/table'
import { useRootStore } from '@/stores/root'
import MinMaxInput from '@/components/MinMaxInput.vue'
import dayjs from 'dayjs'
import { GlassesEyeIndex } from '@/model/GlassesModel'
import { useToast } from 'vue-toastification'
import { TableSortBy, MinMaxObject } from '@/model/ReimsModel'

const toast = useToast()

const tableStore = useTableStore()
const rootStore = useRootStore()
const totalItems = computed(() => tableStore.totalGlassesCount)
const reimsSite = computed(() => rootStore.reimsSite)
const eyeFilters = reactive({
  od: {
    sphere: {} as MinMaxObject,
    cylinder: {} as MinMaxObject,
  },
  os: {
    sphere: {} as MinMaxObject,
    cylinder: {} as MinMaxObject,
  },
})
const glassesTypeFilter = ref<string[]>([])
const sortBy = ref<TableSortBy[]>([{ key: 'sku', order: 'asc' }])
const itemsPerPage = ref(10)
const page = ref(1)
const loading = ref(false)
const items = ref([])

type EyeValueKey = 'sphere' | 'cylinder'

const headers = computed(() => {
  return [
    { key: 'sku', title: 'SKU' },
    { key: 'glassesType', title: 'Type', divider: true },
    { key: 'od.sphere', title: 'OD SPH' },
    { key: 'od.cylinder', title: 'OD CYL' },
    { key: 'od.axis', title: 'OD Axis' },
    { key: 'od.add', title: 'OD Add', divider: true },
    { key: 'os.sphere', title: 'OS SPH' },
    { key: 'os.cylinder', title: 'OS CYL' },
    { key: 'os.axis', title: 'OS Axis' },
    { key: 'os.add', title: 'OS Add', divider: true },
    { key: 'appearance', title: 'Appearance' },
    { key: 'glassesSize', title: 'Size' },
    { key: 'creationDate', title: 'Added' },
    { key: 'actions', title: '', sortable: false },
  ]
})
const filterString = computed(() => {
  let filterString = ''
  const typeFilter = createSingleTypeFilter(glassesTypeFilter.value)
  if (typeFilter) filterString += typeFilter + ';'
  const eyeKeys: GlassesEyeIndex[] = ['od', 'os']
  const eyeValueKeys: EyeValueKey[] = ['sphere', 'cylinder']
  for (const eyeName of eyeKeys) {
    for (const valName of eyeValueKeys) {
      const filter = createSingleFilter(eyeFilters[eyeName][valName], `${eyeName}.${valName}`)
      if (filter) filterString += filter + ';'
    }
  }
  return filterString.slice(0, -1)
})

watch(
  [reimsSite, filterString],
  () => {
    startLoading()
  },
  { immediate: true },
)

function createSingleFilter(value: MinMaxObject, filterName: string): string | null {
  if (value == null) return null

  const min = value.min != null && !isNaN(value.min) ? `${filterName}>=${value.min}` : null
  const max = value.max != null && !isNaN(value.max) ? `${filterName}<=${value.max}` : null
  if (min != null && max != null) {
    // swap min max automatically if entered wrongly
    if (max < min) return max + ';' + min
    else return min + ';' + max
  } else if (min != null) return min
  else if (max != null) return max
  else return null
}

function createSingleTypeFilter(value: string[]): string | null {
  if (value.length === 0) return null
  let filterString = ''
  for (const el of value) {
    if (el === '') continue
    filterString += `glassesType==${el},`
  }
  return filterString.slice(0, -1)
}

function formatDate(date: string) {
  return dayjs(date).format('DD.MM.YYYY')
}

function updateEyeFilter(value: MinMaxObject, eye: GlassesEyeIndex, child: EyeValueKey) {
  eyeFilters[eye][child] = value
}

function formatRx(value: number) {
  return (value >= 0 ? '+' : '-') + Math.abs(value).toFixed(2)
}

function formatAxis(value: string) {
  return parseInt(value).toString().padStart(3, '0')
}

async function startLoading() {
  loading.value = true
  try {
    items.value = await tableStore.loadItems(
      page.value,
      itemsPerPage.value,
      filterString.value,
      sortBy.value[0],
    )
  } catch (error) {
    if (error.status === 404) {
      items.value = []
    } else {
      console.error(error)
      toast.error(`Could not load table data, please retry (Error ${error.status})`)
    }
  }
  loading.value = false
}
</script>
