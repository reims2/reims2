<template>
  <v-data-table
    :headers="headers"
    :items="items"
    v-model:options="options"
    :server-items-length="totalItems"
    :loading="loading"
    dense
    must-sort
    :sort-by="['sku']"
    :mobile-breakpoint="rootStore.isMobileBreakpoint"
    :footer-props="{
      showFirstLastPage: true,
      itemsPerPageOptions: [10, 20, 50, 100, 500],
      showCurrentPage: true,
    }"
    @update:options="startLoading"
  >
    <template v-if="rootStore.isMobile" #item="{ item }">
      <div class="mx-2 pb-1">
        <glass-card :glass="item" />
      </div>
    </template>
    <template v-if="!rootStore.isMobile" #body.prepend>
      <tr>
        <td />
        <td class="v-data-table__divider">
          <v-select
            single-line
            multiple
            dense
            hide-details
            small-chips
            label="Filter"
            :items="['single', 'multifocal']"
            style="min-width: 60px"
            class="fit pb-1"
            @change="(value: string) => (glassesTypeFilter = value)"
          />
        </td>
        <td>
          <min-max-input @update="(value) => updateEyeFilter(value, 'od', 'sphere')" />
        </td>
        <td>
          <min-max-input @update="(value) => updateEyeFilter(value, 'od', 'cylinder')" />
        </td>
        <td />
        <td class="v-data-table__divider" />
        <td>
          <min-max-input @update="(value) => updateEyeFilter(value, 'os', 'sphere')" />
        </td>
        <td>
          <min-max-input @update="(value) => updateEyeFilter(value, 'os', 'cylinder')" />
        </td>
        <td />
        <td class="v-data-table__divider" />
        <td />
        <td />
        <td />
        <td />
      </tr>
    </template>
    <template #item.od.sphere="{ item }"> {{ formatRx(item.od.sphere) }} D </template>
    <template #item.od.cylinder="{ item }"> {{ formatRx(item.od.cylinder) }} D </template>
    <template #item.od.axis="{ item }">
      {{ parseInt(item.od.axis).toString().padStart(3, '0') }}
    </template>
    <template #item.od.add="{ item }"> {{ formatRx(item.od.add) }} D </template>
    <template #item.os.sphere="{ item }"> {{ formatRx(item.os.sphere) }} D </template>
    <template #item.os.cylinder="{ item }"> {{ formatRx(item.os.cylinder) }} D </template>
    <template #item.os.axis="{ item }">
      {{ parseInt(item.os.axis).toString().padStart(3, '0') }}
    </template>
    <template #item.os.add="{ item }"> {{ formatRx(item.os.add) }} D </template>
    <template #item.creationDate="{ item }">
      {{ formatDate(item.creationDate) }}
    </template>
    <template #item.actions="{ item }">
      <v-btn :to="{ path: '/edit', query: { sku: item.sku } }" icon small>
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
import { computed, ref, watch, onActivated } from 'vue'
import dayjs from 'dayjs'

const tableStore = useTableStore()
const rootStore = useRootStore()
const totalItems = computed(() => tableStore.totalGlassesCount)
const location = computed(() => rootStore.location)
const eyeFilters = {
  od: {
    sphere: {},
    cylinder: {},
  },
  os: {
    sphere: {},
    cylinder: {},
  },
}
const glassesTypeFilter = ref('')
const options = ref({ itemsPerPage: 20 })
const loading = ref(false)
const items = ref([])

type EyeKey = 'od' | 'os'
type EyeValueKey = 'sphere' | 'cylinder'

const headers = computed(() => {
  return [
    { value: 'sku', text: 'SKU' },
    { value: 'glassesType', text: 'Type', divider: true },
    { value: 'od.sphere', text: 'OD SPH' },
    { value: 'od.cylinder', text: 'OD CYL' },
    { value: 'od.axis', text: 'OD Axis' },
    { value: 'od.add', text: 'OD Add', divider: true },
    { value: 'os.sphere', text: 'OS SPH' },
    { value: 'os.cylinder', text: 'OS CYL' },
    { value: 'os.axis', text: 'OS Axis' },
    { value: 'os.add', text: 'OS Add', divider: true },
    { value: 'appearance', text: 'Appearance' },
    { value: 'glassesSize', text: 'Size' },
    { value: 'creationDate', text: 'Added' },
    { value: 'actions', text: '', sortable: false },
  ]
})
const filterString = computed(() => {
  let filterString = ''
  const filter = createSingleFilter(glassesTypeFilter, 'glassesType')
  if (filter) filterString += filter + ';'
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
watch(location, () => {
  startLoading()
})
watch(eyeFilters, () => {
  startLoading() // FIXME deep watch
})
onActivated(() => {
  startLoading()
})

function formatDate(date: string) {
  return dayjs(date).format('DD.MM.YYYY')
}

function createSingleFilter(value: any, filterName: string) {
  if (value == null) return null

  if (Array.isArray(value)) {
    let filterString = ''
    for (const el of value) {
      filterString += `${filterName}==${el},`
    }
    return filterString.slice(0, -1)
  } else {
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
}

function updateEyeFilter(value: any, eye: EyeKey, child: EyeValueKey) {
  eyeFilters[eye][child] = value
}

function formatRx(value: number) {
  return (value >= 0 ? '+' : '-') + Math.abs(value).toFixed(2)
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
.v-select.fit {
  width: min-content;
}
.v-select.fit .v-select__selection--comma {
  text-overflow: unset;
}
</style>
