<template>
  <v-container>
    <v-row dense class="justify-center">
      <v-col cols=12 md=6 lg=4 class="px-2">
        <v-form ref="form" v-model="valid" @submit.prevent>
          <v-row dense>
            <v-col
              cols="12"
              class="px-0 pb-0"
            >
              <v-autocomplete
                ref="firstInput"
                v-model="glassesType"
                :items="type_data.options"
                :label="type_data.label"
                :rules="type_data.rules"
                auto-select-first
                :autofocus="!$vuetify.breakpoint.mobile"
                outlined
              />
            </v-col>
            <v-col
              cols=12
              md=6
              class="px-1 pr-md-5 pt-0"
            >
              <single-eye-input
                v-model="od_eye"
                eye-name="OD"
                :add-enabled="glassesType !== 'single'"
              />
            </v-col>
            <v-col
              cols=12
              md=6
              class="px-1 pl-md-5 pt-0"
            >
              <single-eye-input
                :value="os_eye"
                eye-name="OS"
                :add-enabled="glassesType !== 'single'"
                @input="e => {os_eye = e; sync_eye = false}"
              />
            </v-col>
            <v-col cols=12 class="px-0">
              <div>
                <v-btn
                  :disabled="!valid"
                  color="primary"
                  class="mr-4"
                  type="submit"
                  @click="submit"
                >
                  Search glasses
                </v-btn>
                <v-btn
                  class="mr-4"
                  plain
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
        v-if="matches"
        ref="results"
        cols=12
        md=4
        lg=3
        class="px-0 pl-md-6"
      >
        <v-alert
          v-if="!matches.length"
          type="warning"
          outlined
          dense
        >
          No suitable glasses found. Please try another search.
        </v-alert>
        <div v-else>
          <glass-card
            v-for="item in matches.slice(itemsPerPage*(page-1),itemsPerPage*(page-1)+itemsPerPage)"
            :key="item.sku"
            :glass="item"
          >
            <template #actions>
              <v-btn
                nuxt
                :to="{path:'/edit', query: { sku: item.sku }}"
                text
                class="mx-0"
              >
                Open Glasses
              </v-btn>
            </template>
          </glass-card>
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
import { mapActions } from 'vuex'
import { matchesAsCsvUri } from '../lib/util'

export default {
  transition: 'main',
  data: () => ({
    matches: null,
    valid: false,
    page: 1,
    glassesType: '',
    os_eye: {},
    od_eye: {},
    sync_eye: true,
    itemsPerPage: 3,
    type_data:
      {
        label: 'Type',
        options: [{
          text: 'single vision',
          value: 'single'
        }, {
          text: 'multifocal',
          value: 'multifocal'
        }],
        rules: [v => !!v || 'Item is required']
      }
  }),
  head() {
    return {
      title: 'Find matches'
    }
  },
  computed: {
    _matchesAsCSVUri() {
      if (!this.matches) return ''
      return matchesAsCsvUri(this.matches.slice(0, 30))
    }
  },
  watch: {
    od_eye() {
      if (this.sync_eye) {
        // setting manually to trigger reactive system in SingleEyeInput
        this.$set(this.os_eye, 'add', this.od_eye.add)
      }
    }
  },
  methods: {
    ...mapActions({
      philScore: 'glasses/philScore'
    }),
    async submit() {
      const eyeModel = {}
      eyeModel.glassesType = this.glassesType
      eyeModel.os = this.os_eye
      eyeModel.od = this.od_eye
      // todo maybe block submit if allGlasses is empty/null
      this.matches = await this.philScore(eyeModel)
      this.page = 1
      this.sync_eye = true

      this.$nextTick(() => {
        // on desktop, focus input again; on mobile, scroll to bottom
        if (!this.$vuetify.breakpoint.mobile) this.$refs.firstInput.focus()
        else if (this.$refs.results) this.$refs.results.scrollIntoView(true)
      })
    },
    reset() {
      this.$refs.form.reset()
      this.matches = null
      setTimeout(() => { this.$refs.firstInput.focus() })
      this.sync_eye = true
    },
    calcPageCount() {
      if (!this.matches) return 0
      const pages = Math.ceil(this.matches.length / this.itemsPerPage)
      return pages > 10 ? 10 : pages
    }
  },
  title: 'Find glasses'
}
</script>
