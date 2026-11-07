<!-- eslint-disable vue/valid-v-slot -->
<template>
  <page-layout title="Inventory">
    <v-col cols="12">
      <v-card border elevation="1">
        <div class="d-flex flex-wrap align-center ga-2 px-4 py-3 border-b">
          <v-btn-toggle
            v-model="glassesTypeFilter"
            multiple
            color="primary"
            variant="outlined"
            divided
            density="compact"
            role="group"
            aria-label="Type"
          >
            <v-btn value="single">Single</v-btn>
            <v-btn value="multifocal">Multifocal</v-btn>
          </v-btn-toggle>
          <v-menu
            v-for="filter in filters"
            :key="filter.label"
            :close-on-content-click="false"
            location="bottom start"
          >
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                color="primary"
                tag="button"
                :variant="summary(filter) === 'any' ? 'outlined' : 'flat'"
                class="font-weight-semibold text-tabular"
              >
                <span class="d-inline-flex align-baseline ga-2">
                  <span class="text-label-small font-weight-bold">{{ filter.label }}</span>
                  {{ summary(filter) }}
                </span>
              </v-chip>
            </template>
            <v-card class="d-flex align-center ga-2 pa-4">
              <min-max-input v-model="eyeFilters[filter.eye][filter.value]" :label="filter.label" />
              <v-btn
                variant="text"
                color="primary"
                @click="eyeFilters[filter.eye][filter.value] = {}"
              >
                Clear
              </v-btn>
            </v-card>
          </v-menu>
          <v-spacer />
          <span class="text-body-medium text-medium-emphasis text-tabular">
            <strong class="text-high-emphasis">
              {{ formattedItems.length.toLocaleString('en-US') }}
            </strong>
            of {{ inStock.toLocaleString('en-US') }}
          </span>
          <v-btn variant="text" color="primary" @click="reset">Clear all</v-btn>
        </div>

        <v-data-table
          v-model:items-per-page="itemsPerPage"
          v-model:sort-by="sortBy"
          v-model:page="page"
          :headers="headers"
          :items="formattedItems"
          :header-props="{
            class:
              'bg-surface-muted text-medium-emphasis text-body-small font-weight-semibold px-3',
          }"
          :cell-props="{ class: 'px-3' }"
          density="comfortable"
          fixed-header
          height="560"
          style="--v-table-header-height: 26px"
          must-sort
          class="text-tabular"
          items-per-page-text="Rows per page"
          page-text="{0} to {1} of {2}"
          :items-per-page-options="itemsPerPageOptions"
        >
          <template #header.edit>
            <span class="d-sr-only">Actions</span>
          </template>
          <template #item.edit="{ item }">
            <v-btn
              :icon="mdiPencilOutline"
              variant="text"
              size="small"
              class="text-medium-emphasis"
              :aria-label="`Edit SKU ${item.sku}`"
              :to="{ name: 'Edit', query: { sku: item.glasses.sku } }"
            />
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </page-layout>
</template>

<script setup lang="ts">
import { mdiPencilOutline } from '@mdi/js'
import PageLayout from '@/components/PageLayout.vue'
import MinMaxInput from '@/components/MinMaxInput.vue'
import { parseRange, useTableFilter } from '@/composables/table-filter'
import { GlassesEyeIndex } from '@/model/GlassesModel'
import { TableSortBy } from '@/model/ReimsModel'
import { useGlassesStore } from '@/stores/glasses'
import { formatDiopter, formatGlassesForDisplay } from '@/util/format-glasses'

const groupStart = { class: 'border-s' }
const capitalize = { class: 'text-capitalize' }

const rxColumns = { sphere: 'SPH', cylinder: 'CYL', axis: 'Axis', add: 'Add' } as const

// OD reads teal and OS marigold, like their labels everywhere else
function eyeHeader(eye: GlassesEyeIndex) {
  const color = eye === 'os' ? 'marigold' : 'primary'
  const tint = `bg-${color}-tonal`
  return {
    title: eye.toUpperCase(),
    align: 'center' as const,
    headerProps: { class: `border-s font-weight-bold ${tint} text-${color}` },
    children: Object.entries(rxColumns).map(([value, title], idx) => ({
      key: `${eye}.${value}`,
      title,
      align: 'end' as const,
      headerProps: { class: idx === 0 ? `border-s ${tint}` : tint },
      cellProps: { class: idx === 0 ? 'border-s text-rx' : 'text-rx' },
    })),
  }
}

const headers = [
  { key: 'sku', title: 'SKU', cellProps: { class: 'font-weight-bold' } },
  { key: 'glassesType', title: 'Type', cellProps: capitalize },
  eyeHeader('od'),
  eyeHeader('os'),
  {
    key: 'appearance',
    title: 'Appearance',
    headerProps: groupStart,
    cellProps: { class: 'border-s text-capitalize' },
  },
  { key: 'glassesSize', title: 'Size', cellProps: capitalize },
  {
    key: 'creationDate',
    title: 'Added',
    cellProps: { class: 'text-medium-emphasis' },
    sortRaw: (a: TableItem, b: TableItem) => a.addedAt - b.addedAt,
  },
  { key: 'edit', title: 'Actions', sortable: false, width: 48 },
]

const filters = [
  { label: 'OD SPH', eye: 'od', value: 'sphere' },
  { label: 'OD CYL', eye: 'od', value: 'cylinder' },
  { label: 'OS SPH', eye: 'os', value: 'sphere' },
  { label: 'OS CYL', eye: 'os', value: 'cylinder' },
] as const

// the range the table filters on, so the chip can't disagree with it
function summary({ eye, value }: (typeof filters)[number]) {
  const [from, to] = (parseRange(eyeFilters[eye][value]) ?? []).map((bound) =>
    isFinite(bound) ? formatDiopter(bound, true) : null,
  )
  if (from && to) return from === to ? from : `${from} to ${to}`
  if (from) return `from ${from}`
  if (to) return `up to ${to}`
  return 'any'
}

const itemsPerPageOptions = [10, 20, 50, 100, 250]

const page = ref(1)
const itemsPerPage = ref(20)
const sortBy = ref<TableSortBy[]>([{ key: 'sku', order: 'asc' }])

const glassesTypeFilter = ref<string[]>([])

const glassesStore = useGlassesStore()
const inStock = computed(() => glassesStore.allGlasses.length)
const { filteredGlasses, resetFilters, eyeFilters } = useTableFilter(
  () => glassesStore.allGlasses,
  glassesTypeFilter,
)

// keep the raw glasses so the formatted date column can sort chronologically
const formattedItems = computed(() =>
  filteredGlasses.value.map((glasses) => ({
    ...formatGlassesForDisplay(glasses),
    glasses,
    addedAt: Date.parse(glasses.creationDate),
  })),
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
