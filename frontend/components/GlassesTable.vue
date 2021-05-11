<template>
  <v-data-table
    v-if="!$vuetify.breakpoint.mobile"
    :headers="headers"
    :items="items"
    :items-per-page="20"
    dense
    must-sort
    sort-by="sku"
    :footer-props="{
      showFirstLastPage: true,
      itemsPerPageOptions: [10,20,100,500],
      showCurrentPage: true
    }"
  >
    <template #body.prepend>
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
          <min-max-input @update="value => {updateFilter(value, 'od', 'cyl')}" />
        </td>
        <td />
        <td />
        <td>
          <min-max-input @update="value => {updateFilter(value, 'os', 'sphere')}" />
        </td>
        <td>
          <min-max-input @update="value => {updateFilter(value, 'os', 'cyl')}" />
        </td>
      </tr>
    </template>
  </v-data-table>
  <div v-else class="px-4">
    <glass-card
      v-for="item in glasses.slice(glassesPerMobilePage*(page-1),glassesPerMobilePage*(page-1)+glassesPerMobilePage)"
      :key="item.sku"
      :glass="item"
      no-actions
    />
    <div class="text-center">
      <v-pagination
        v-model="page"
        :length="Math.ceil(glasses.length/glassesPerMobilePage)"
        :total-visible="9"
        circle
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    glasses: {
      type: Array,
      required: true
    }
  },
  data: () => ({
    filterType: [],
    filters: {
      od: {
        sphere: {},
        cyl: {}
      },
      os: {
        sphere: {},
        cyl: {}
      }
    },
    page: 1,
    glassesPerMobilePage: 10
  }),
  computed: {
    headers() {
      return [
        { value: 'sku', text: 'SKU' },
        { value: 'type', text: 'Type' },
        { value: 'odsphere', text: 'OD Sphere' },
        { value: 'odcyl', text: 'OD Cyl' },
        { value: 'odaxis', text: 'OD Axis' },
        { value: 'odadd', text: 'OD Add' },
        { value: 'ossphere', text: 'OS Sphere' },
        { value: 'oscyl', text: 'OS Cyl' },
        { value: 'osaxis', text: 'OS Axis' },
        { value: 'osadd', text: 'OS Add' },
        { value: 'appearance', text: 'Appearance' },
        { value: 'size', text: 'Size' }
      ]
    },
    items() {
      return this.glasses.filter((el) => {
        if (this.filterType.length > 0 && !this.filterType.includes(el.type)) return false
        if (!this.isInLimits(el.od.sphere, this.filters.od.sphere)) return false
        if (!this.isInLimits(el.od.cyl, this.filters.od.cyl)) return false
        if (!this.isInLimits(el.os.sphere, this.filters.os.sphere)) return false
        if (!this.isInLimits(el.os.cyl, this.filters.os.cyl)) return false
        return true
      }).map((el) => {
        // map to flat object for table
        el.odsphere = el.od.sphere
        el.odaxis = el.od.axis
        el.odcyl = el.od.cyl
        el.odadd = el.od.add
        el.ossphere = el.os.sphere
        el.osaxis = el.os.axis
        el.oscyl = el.os.cyl
        el.osadd = el.os.add
        return el
      })
    }
  },
  methods: {
    isInLimits(value, filters) {
      const min = filters.min !== '' && filters.min !== undefined ? filters.min : null
      const max = filters.max !== '' && filters.max !== undefined ? filters.max : null
      if (min != null && max != null) return value >= min && value <= max
      else if (min != null) return value >= min
      else if (max != null) return value <= max
      else return true
    },
    updateFilter(value, eye, child) {
      this.filters[eye][child] = value
    }
  }
}
</script>
