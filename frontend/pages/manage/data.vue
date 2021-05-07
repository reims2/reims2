<template>
  <v-container class="px-1 px-lg-10" fluid>
    <v-row dense class="d-flex justify-center">
      <v-col cols=12>
        <v-data-table
          fixed-header
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  title: 'View and analyse data',
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
    }
  }),
  computed: {
    ...mapState({
      glasses: state => state.glasses.glasses
    }),
    headers() {
      return [
        { value: 'sku', text: 'SKU' },
        { value: 'type', text: 'TYPE' },
        { value: 'odsphere', text: 'OD SPHERE' },
        { value: 'odcylinder', text: 'OD CYLINDER' },
        { value: 'odaxis', text: 'OD AXIS' },
        { value: 'odadd', text: 'OD ADD' },
        { value: 'ossphere', text: 'OS SPHERE' },
        { value: 'oscylinder', text: 'OS CYLINDER' },
        { value: 'osaxis', text: 'OS AXIS' },
        { value: 'osadd', text: 'OS ADD' },
        { value: 'appearance', text: 'APPEARANCE' },
        { value: 'size', text: 'SIZE' }
      ]
    },
    items() {
      return this.glasses.filter((el) => {
        if (this.filterType.length > 0 && !this.filterType.includes(el.type)) return false
        if (!this.isInLimits(el.odsphere, this.filters.od.sphere)) return false
        if (!this.isInLimits(el.odcylinder, this.filters.od.cyl)) return false
        if (!this.isInLimits(el.ossphere, this.filters.os.sphere)) return false
        if (!this.isInLimits(el.oscylinder, this.filters.os.cyl)) return false
        return true
      })
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    ...mapActions({
      load: 'glasses/loadActiveGlasses'
    }),
    isInLimits(value, filters) {
      const min = filters.min !== '' && filters.min !== undefined ? filters.min : null
      const max = filters.min !== '' && filters.min !== undefined ? filters.min : null
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
