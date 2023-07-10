<template>
  <v-data-table
    :headers="headers"
    :items="items"
    v-model:options="options"
    :server-items-length="totalItems"
    :loading="loading"
    dense
    must-sort
    :sort-by="sortBy"
    :mobile-breakpoint="rootStore.isMobile"
    :footer-props="{
      showFirstLastPage: true,
      itemsPerPageOptions: [10, 20, 50, 100, 500],
      showCurrentPage: true,
    }"
    @update:options="startLoading"
  >
    <template v-if="!rootStore.isMobile" #thead>
      <tr>
        <td />
        <td class="v-data-table__divider">
          <v-select
            single-line
            multiple
            density="compact"
            variant="underlined"
            hide-details
            small-chips
            label="Filter"
            :items="['single', 'multifocal']"
            style="min-width: 70px"
            class="fit pb-1 px-2"
            @change="(value: string[]) => (glassesTypeFilter = value)"
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

    <template v-if="rootStore.isMobile" #item="{ item }">
      <div class="mx-2 pb-1">
        <glass-card :glass="item" />
      </div>
    </template>
    <template #item.od.sphere="{ item }"> {{ formatRx(item.columns['od.sphere']) }} D </template>
    <template #item.od.cylinder="{ item }">
      {{ formatRx(item.columns['od.cylinder']) }} D
    </template>
    <template #item.od.axis="{ item }"> {{ formatAxis(item.columns['od.axis']) }} </template>
    <template #item.od.add="{ item }"> {{ formatRx(item.columns['od.add']) }} D </template>
    <template #item.os.sphere="{ item }"> {{ formatRx(item.columns['os.sphere']) }} D </template>
    <template #item.os.cylinder="{ item }">
      {{ formatRx(item.columns['os.cylinder']) }} D
    </template>
    <template #item.os.axis="{ item }"> {{ formatAxis(item.columns['os.axis']) }} </template>
    <template #item.os.add="{ item }"> {{ formatRx(item.columns['os.add']) }} D </template>
    <template #item.creationDate="{ item }"> {{ formatDate(item.columns.creationDate) }} </template>
    <template #item.actions="{ item }">
      <v-btn :to="{ path: '/edit', query: { sku: item.columns.sku } }" icon size="x-small">
        <v-icon>{{ mdiPencil }}</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { mdiPencil } from '@mdi/js'
import { useTableStore } from '@/stores/table'
import { useRootStore } from '@/stores/root'
import GlassCard from '@/components/GlassCard.vue'
import MinMaxInput from '@/components/MinMaxInput.vue'
import { reactive, computed, ref, watch, onActivated } from 'vue'
import dayjs from 'dayjs'

const tableStore = useTableStore()
const rootStore = useRootStore()
const totalItems = computed(() => tableStore.totalGlassesCount)
const reimsSite = computed(() => rootStore.reimsSite)
const eyeFilters = reactive({
  od: {
    sphere: {},
    cylinder: {},
  },
  os: {
    sphere: {},
    cylinder: {},
  },
})
const glassesTypeFilter = reactive<string[]>([])
const options = ref({ itemsPerPage: 20 })
const loading = ref(false)
const items = ref([])

interface SortBy {
  key: string
  order: 'asc' | 'desc'
}
const sortBy = [{ key: 'sku', order: 'asc' }] as SortBy[]

type EyeKey = 'od' | 'os'
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
  const typeFilter = createSingleTypeFilter(glassesTypeFilter)
  if (typeFilter) filterString += typeFilter + ';'
  const eyeKeys: EyeKey[] = ['od', 'os']
  const eyeValueKeys: EyeValueKey[] = ['sphere', 'cylinder']
  for (const eyeName of eyeKeys) {
    for (const valName of eyeValueKeys) {
      const filter = createSingleFilter(eyeFilters[eyeName][valName], `${eyeName}.${valName}`)
      if (filter) filterString += filter + ';'
    }
  }
  return filterString.slice(0, -1)
})
watch(reimsSite, () => {
  startLoading()
})
watch(eyeFilters, () => {
  startLoading()
})
watch(glassesTypeFilter, () => {
  startLoading()
})
onActivated(() => {
  startLoading()
})

function createSingleFilter(value: any, filterName: string): string | null {
  if (value == null) return null

  const min = !isNaN(value.min) ? `${filterName}>=${value.min}` : null
  const max = !isNaN(value.max) ? `${filterName}<=${value.max}` : null
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

function updateEyeFilter(value: any, eye: EyeKey, child: EyeValueKey) {
  eyeFilters[eye][child] = value
}

function formatRx(value: number) {
  return (value >= 0 ? '+' : '-') + Math.abs(value).toFixed(2)
}

function formatAxis(value: string) {
  return parseInt(value).toString().padStart(3, '0')
}

async function startLoading() {
  setTimeout(() => {
    if (rootStore.isMobile) {
      // loading bar
    }
  })
  loading.value = true
  try {
    items.value = await tableStore.loadItems(options.value, filterString.value)
  } catch (error) {
    if (error.status === 404) {
      items.value = []
    } else {
      rootStore.setError(`Could not load data, please retry (Error ${error.status})`)
    }
  }
  loading.value = false
}
</script>

<style scoped>
.v-select.fit .v-select__selection--comma {
  text-overflow: unset;
}
</style>
