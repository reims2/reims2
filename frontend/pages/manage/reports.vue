<template>
  <v-container>
    <v-row dense class="d-flex justify-center">
      <v-col cols=12 md=6 lg=4>
        <div class="pb-2">
          Select a date range below to generate a table of all dispensed glasses during that time.
        </div>
        <div class="pt-4">
          <v-menu
            v-model="startMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                :value="startDate"
                label="From"
                :prepend-icon="mdiCalendar"
                readonly
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="startDate"
              no-title
              scrollable
              @input="startMenu = false"
            />
          </v-menu>
        </div>
        <div class="pb-4">
          <v-menu
            v-model="endMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                :value="endDate"
                label="To"
                :prepend-icon="mdiCalendar"
                readonly
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="endDate"
              no-title
              scrollable
              @input="endMenu = false"
            />
          </v-menu>
        </div>

        <v-btn
          color="primary"
          :loading="loading"
          :href="csvUri"
          target="_blank"
          download='dispensed.csv'
          :disabled="!csvUri || csvUri == ''"
        >
          Download report
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mdiCalendar } from '@mdi/js'
import { mapActions } from 'vuex'
import { dispensedAsCsv } from '../../lib/util'
export default {
  data: () => ({
    startDate: '',
    endDate: '',
    startMenu: false,
    endMenu: false,
    mdiCalendar,
    loading: false,
    csvUri: ''
  }),
  title: 'Create reports',
  watch: {
    startDate() {
      this.submit()
    },
    endDate() {
      this.submit()
    }
  },
  created() {
    this.startDate = this.$dayjs().subtract(1, 'year').format('YYYY-MM-DD')
    this.endDate = this.$dayjs().format('YYYY-MM-DD')
  },
  methods: {
    ...mapActions({
      loadItems: 'glasses/loadDispensed'
    }),
    async submit() {
      this.loading = true
      this.csvUri = ''
      try {
        const items = await this.loadItems({
          startDate: this.$dayjs(this.startDate).format('MM/DD/YYYY'),
          endDate: this.$dayjs(this.endDate).add(1, 'day').format('MM/DD/YYYY')
        })
        this.csvUri = dispensedAsCsv(items)
      } catch (err) {
        if (err.status === 404) {
          // fixme better UX?
        } else {
          // todo error handling
          console.log(err)
        }
      }
      this.loading = false
    }
  }
}
</script>
