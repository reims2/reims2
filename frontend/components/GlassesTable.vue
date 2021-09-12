<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :options.sync="options"
    :server-items-length="totalItems"
    :loading="loading"
    dense
    must-sort
    sort-by="sku"
    :mobile-breakpoint="$vuetify.breakpoint.mobileBreakpoint"
    :footer-props="{
      showFirstLastPage: true,
      itemsPerPageOptions: [10,20,100,500],
      showCurrentPage: true
    }"
    @update:options="startLoading"
  >
    <template v-if="$vuetify.breakpoint.mobile" #item={item}>
      <glass-card :glass="item" class="ma-2" />
    </template>
    <template #item.od.sphere="{ item }">
      {{ formatRx(item.od.sphere) }} D
    </template>
    <template #item.od.cylinder="{ item }">
      {{ formatRx(item.od.cylinder) }} D
    </template>
    <template #item.od.axis="{ item }">
      {{ parseInt(item.od.axis).toString().padStart(3, '0') }}
    </template>
    <template #item.od.add="{ item }">
      {{ formatRx(item.od.add) }} D
    </template>
    <template #item.os.sphere="{ item }">
      {{ formatRx(item.os.sphere) }} D
    </template>
    <template #item.os.cylinder="{ item }">
      {{ formatRx(item.os.cylinder) }} D
    </template>
    <template #item.os.axis="{ item }">
      {{ parseInt(item.os.axis).toString().padStart(3, '0') }}
    </template>
    <template #item.os.add="{ item }">
      {{ formatRx(item.os.add) }} D
    </template>
    <template #item.creationDate="{ item }">
      {{ $dayjs(item.creationDate).format('DD.MM.YYYY') }}
    </template>
  </v-data-table>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  data: () => ({
    filterType: [],
    filters: {
      od: {
        sphere: {},
        cylinder: {}
      },
      os: {
        sphere: {},
        cylinder: {}
      }
    },
    options: { itemsPerPage: 20 },
    loading: false,
    items: []
  }),
  computed: {
    ...mapState({
      totalItems: state => state.table.totalGlassesCount,
      location: state => state.location
    }),
    headers() {
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
        { value: 'creationDate', text: 'Added' }
      ]
    }
  },
  watch: {
    location() {
      this.startLoading()
    }
  },
  methods: {
    ...mapActions({
      loadItems: 'table/loadItems'
    }),
    isInLimits(value, filters) {
      value = Number(value)
      const min = filters.min !== '' && filters.min !== undefined ? filters.min : null
      const max = filters.max !== '' && filters.max !== undefined ? filters.max : null
      if (min != null && max != null) return value >= min && value <= max
      else if (min != null) return value >= min
      else if (max != null) return value <= max
      else return true
    },
    updateFilter(value, eye, child) {
      this.filters[eye][child] = value
    },
    formatRx(value) {
      return (value >= 0 ? '+' : '-') + Math.abs(value).toFixed(2)
    },
    async startLoading() {
      this.loading = true
      try {
        this.items = await this.loadItems(this.options)
      } catch (err) {
        this.loading = false
        // todo error handling
        console.log(err)
      }
      this.loading = false
    }

  }
}
</script>
