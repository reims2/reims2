<template>
  <v-container @keyup.s="submitAndUpdate">
    <v-row dense class="justify-center">
      <v-col cols=12 md=6 lg=5 class="px-3">
        <v-form ref="form" v-model="valid" @submit.prevent>
          <v-row dense>
            <v-col
              cols="12"
              class="px-0 pb-3"
            >
              <auto-complete-field
                ref="firstInput"
                v-model="glassesType"
                v-bind="glassesTypeData"
                :persistent-hint=true
              />
            </v-col>
            <v-col
              cols=12
              md=6
              class="px-1 pr-md-5 py-md-0 py-1"
            >
              <single-eye-input
                v-bind="odEye"
                eye-name="OD"
                :add-enabled="glassesType === 'multifocal'"
                @input="e => {odEye[e.id] = e.value}"
              />
            </v-col>
            <v-col
              cols=12
              md=6
              class="px-1 pl-md-5 py-0"
            >
              <single-eye-input
                v-bind="osEye"
                eye-name="OS"
                :add-enabled="glassesType === 'multifocal'"
                @input="e => {osEye[e.id] = e.value; syncEye = false}"
              />
            </v-col>
            <v-col
              cols=12
              class="pa-0 pb-1"
            >
              <v-checkbox
                v-model="high_tolerance"
                default-value=false
                label="Increase search tolerance (might yield bad results)"
                tabindex="-1"
              />
            </v-col>
            <v-col cols=12 class="px-0">
              <div>
                <v-btn
                  v-prevent-enter-tab
                  :disabled="Boolean(searchButtonDisabled)"
                  color="primary"
                  class="mr-4"
                  type="submit"
                  @click="submitAndUpdate"
                >
                  <span class="text-decoration-underline">S</span>earch glasses
                </v-btn>
                <v-btn
                  v-prevent-enter-tab
                  class="mr-4"
                  plain
                  tabindex="-1"
                  @click="reset"
                >
                  Clear form
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
      <v-col
        ref="results"
        cols=12
        md=6
        lg=5
        xl=3
        class="pt-10 pt-md-1 px-0 pl-md-6"
      >
        <v-alert
          v-if="matches == null"
          type="info"
          outlined
          color="primary"
          dense
        >
          Start a new search to display results
        </v-alert>
        <v-alert
          v-else-if="matches.length === 0"
          type="warning"
          outlined
          dense
        >
          No suitable glasses found. Please try another search.
        </v-alert>
        <div v-else>
          <div
            v-for="item in paginatedMatches"
            :key="item.id"
          >
            <glass-card :glass="item">
              <template #actions>
                <v-btn
                  nuxt
                  :to="{path:'/edit', query: { sku: item.sku }}"
                  text
                  class="mx-0"
                  color="primary"
                >
                  Open Glasses
                </v-btn>
              </template>
            </glass-card>
          </div>
          <div class="text-center">
            <v-pagination
              v-model="page"
              :length="calcPageCount()"
              circle
            />
          </div>
          <div class="mt-2 text-right">
            <a
              :href="_matchesAsCSVUri"
              target="_blank"
              class="text--secondary text-caption no-decoration"
              download='matches.csv'
            >
              Download as CSV
            </a>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { matchesAsCsvUri, generalEyeData } from '../lib/util'
import { ModifiedEnterToTabMixin } from '@/plugins/vue-enter-to-tab'

export default {
  mixins: [ModifiedEnterToTabMixin],
  transition: 'main',
  data: () => ({
    matches: null,
    valid: false,
    page: 1,
    glassesType: '',
    odEye: { axis: '', cylinder: '', sphere: '', add: '' },
    osEye: { axis: '', cylinder: '', sphere: '', add: '' },
    high_tolerance: false,
    syncEye: true,
    itemsPerPage: 3,
    glassesTypeData: generalEyeData.find((obj) => { return obj.id === 'glassesType' })
  }),
  title: 'Find glasses',
  head() {
    return {
      title: 'Find matches'
    }
  },
  computed: {
    ...mapState({
      allGlasses: state => state.allGlasses
    }),
    _matchesAsCSVUri() {
      if (!this.matches) return ''
      return matchesAsCsvUri(this.matches.slice(0, 30))
    },
    searchButtonDisabled() {
      return !this.valid && this.hasGlassesLoaded
    },
    paginatedMatches() {
      if (this.matches == null) return null
      return this.matches.slice(this.itemsPerPage * (this.page - 1), this.itemsPerPage * (this.page - 1) + this.itemsPerPage)
    }
  },
  watch: {
    'odEye.add'(newVal) {
      if (this.syncEye) {
        // setting manually to trigger reactive system in SingleEyeInput
        this.$set(this.osEye, 'add', newVal)
      }
    },
    odEye: {
      handler() {
        // clear matches to avoid confusion
        this.matches = null
      },
      deep: true
    },
    osEye: {
      handler() {
        this.matches = null
      },
      deep: true
    },
    glassesType() {
      this.matches = null
    },
    allGlasses() {
      if (this.valid) this.loadMatches()
    }
  },
  methods: {
    ...mapActions({
      philScore: 'glasses/philScore'
    }),
    ...mapGetters({
      hasGlassesLoaded: 'glasses/hasGlassesLoaded'
    }),
    async submitAndUpdate() {
      console.log('submit detected')
      if (!this.valid) return
      await this.loadMatches()
      this.page = 1
      // this.syncEye = true // fixme good hgere?

      this.$nextTick(() => {
        // on desktop, focus input again; on mobile, scroll to bottom
        if (!this.$vuetify.breakpoint.mobile) this.$refs.firstInput.focus()
        else if (this.$refs.results) this.$refs.results.scrollIntoView(true)
      })
    },
    async loadMatches() {
      const eyeModel = {}
      eyeModel.glassesType = this.glassesType
      eyeModel.os = { ...this.osEye }
      eyeModel.od = { ...this.odEye }
      eyeModel.highTolerance = this.high_tolerance

      this.matches = await this.philScore(eyeModel)
    },
    reset() {
      this.$refs.form.reset()
      this.matches = null
      setTimeout(() => { this.$refs.firstInput.focus() })
      this.syncEye = true
    },
    calcPageCount() {
      if (!this.matches) return 0
      const pages = Math.ceil(this.matches.length / this.itemsPerPage)
      return pages > 10 ? 10 : pages
    }
  }
}
</script>
