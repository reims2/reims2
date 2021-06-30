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
    :footer-props="{
      showFirstLastPage: true,
      itemsPerPageOptions: [10,20,100,500],
      showCurrentPage: true
    }"
  >
    <template v-if="!$vuetify.breakpoint.mobile" #body.prepend>
      <tr>
        <td />
        <td>
          <div class="d-flex mt-3 mb-1">
            <v-select
              multiple
              dense
              hide-details
              label="Type"
              :items="['single', 'bifocal', 'progressive']"
              style="max-width:250px;"
              @change="value => {filterType = value}"
            />
          </div>
        </td>
        <td>
          <min-max-input @update="value => {updateFilter(value, 'od', 'sphere')}" />
        </td>
        <td>
          <min-max-input @update="value => {updateFilter(value, 'od', 'cylinder')}" />
        </td>
        <td />
        <td />
        <td>
          <min-max-input @update="value => {updateFilter(value, 'os', 'sphere')}" />
        </td>
        <td>
          <min-max-input @update="value => {updateFilter(value, 'os', 'cylinder')}" />
        </td>
      </tr>
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
    loading: false
  }),
  computed: {
    ...mapState({
      glasses: state => state.table.items,
      totalItems: state => state.table.totalItems,
      location: state => state.location
    }),
    headers() {
      return [
        { value: 'sku', text: 'SKU' },
        { value: 'glassesType', text: 'Type' },
        { value: 'odsphere', text: 'OD Sphere' },
        { value: 'odcylinder', text: 'OD Cyl' },
        { value: 'odaxis', text: 'OD Axis' },
        { value: 'odadd', text: 'OD Add' },
        { value: 'ossphere', text: 'OS Sphere' },
        { value: 'oscylinder', text: 'OS Cyl' },
        { value: 'osaxis', text: 'OS Axis' },
        { value: 'osadd', text: 'OS Add' },
        { value: 'appearance', text: 'Appearance' },
        { value: 'glassesSize', text: 'Size' }
      ]
    },
    items() {
      return this.glasses.filter((el) => {
        if (this.filterType.length > 0 && !this.filterType.includes(el.glassesType)) return false
        if (!this.isInLimits(el.od.sphere, this.filters.od.sphere)) return false
        if (!this.isInLimits(el.od.cylinder, this.filters.od.cylinder)) return false
        if (!this.isInLimits(el.os.sphere, this.filters.os.sphere)) return false
        if (!this.isInLimits(el.os.cylinder, this.filters.os.cylinder)) return false
        return true
      }).map((el) => {
        // map to flat object for table
        el.odsphere = this.formatRx(el.od.sphere)
        el.odaxis = parseInt(el.od.axis)
        el.odcylinder = this.formatRx(el.od.cylinder)
        el.odadd = this.formatRx(el.od.add)
        el.ossphere = this.formatRx(el.os.sphere)
        el.osaxis = parseInt(el.os.axis)
        el.oscylinder = this.formatRx(el.os.cylinder)
        el.osadd = this.formatRx(el.os.add)
        return el
      })
    }
  },
  watch: {
    options: {
      handler() {
        this.$nuxt.$loading.start()
        this.loadItems(this.options)
      },
      deep: true
    },
    location() {
      this.loadItems(this.options)
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
    }
  }
}
</script>
