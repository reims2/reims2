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
      <div class="mx-2 pb-1">
        <glass-card :glass="item" />
      </div>
    </template>
    <template v-if="!$vuetify.breakpoint.mobile" #body.prepend>
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
            style="min-width:60px;"
            class="fit pb-1"
            @change="value => updateFilter(value, null, 'glassesType')"
          />
        </td>
        <td>
          <min-max-input @update="value => updateFilter(value, 'od', 'sphere')" />
        </td>
        <td>
          <min-max-input @update="value => updateFilter(value, 'od', 'cylinder')" />
        </td>
        <td />
        <td class="v-data-table__divider" />
        <td>
          <min-max-input @update="value => updateFilter(value, 'os', 'sphere')" />
        </td>
        <td>
          <min-max-input @update="value => updateFilter(value, 'os', 'cylinder')" />
        </td>
        <td />
        <td class="v-data-table__divider" />
        <td />
        <td />
        <td />
        <td />
      </tr>
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
    <template #item.actions="{item}">
      <v-btn
        nuxt
        :to="{path:'/edit', query: { sku: item.sku }}"
        icon
        small
      >
        <v-icon>{{ mdiPencil }}</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { mdiPencil } from '@mdi/js'
export default {
  data: () => ({
    filters: {
      glassesType: [],
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
    items: [],
    mdiPencil
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
        { value: 'creationDate', text: 'Added' },
        { value: 'actions', text: '', sortable: false }
      ]
    },
    filterString() {
      let filterString = ''
      for (const valueName of ['glassesType']) {
        const filter = this.createSingleFilter(this.filters[valueName], valueName)
        if (filter) filterString += filter + ';'
      }
      for (const eyeName of ['od', 'os']) {
        for (const valName of ['sphere', 'cylinder']) {
          const filter = this.createSingleFilter(this.filters[eyeName][valName], `${eyeName}.${valName}`)
          if (filter) filterString += filter + ';'
        }
      }
      return filterString.slice(0, -1)
    }
  },
  watch: {
    location() {
      this.startLoading()
    },
    filters: {
      handler() {
        this.startLoading()
      },
      deep: true
    }
  },
  methods: {
    ...mapActions({
      loadItems: 'table/loadItems'
    }),
    createSingleFilter(value, filterName) {
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
    },
    updateFilter(value, eye, child) {
      if (eye) this.filters[eye][child] = value
      else this.filters[child] = value
    },
    formatRx(value) {
      return (value >= 0 ? '+' : '-') + Math.abs(value).toFixed(2)
    },
    async startLoading() {
      setTimeout(() => { if (this.$vuetify.breakpoint.mobile) this.$nuxt.$loading.start() })
      this.loading = true
      try {
        this.items = await this.loadItems({ options: this.options, filterString: this.filterString })
      } catch (error) {
        if (error.status === 404) {
          this.items = []
        } else {
          this.$store.commit('setError', `Could not load data, please retry (Error ${error.status})`)
        }
      }
      this.loading = false
    }

  }
}
</script>

<style scoped>
.v-select.fit {
  width: min-content;
}
.v-select.fit  .v-select__selection--comma {
    text-overflow: unset;
}
</style>
