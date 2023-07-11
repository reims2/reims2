<template>
  <v-container @keyup.a="submit">
    <v-row class="justify-center" dense>
      <v-col cols="12" md="6" lg="4" class="pb-2 px-2 pt-4">
        <v-form ref="form" v-model="valid" @submit.prevent>
          <v-row dense>
            <v-col v-for="item in generalEyeData" :key="item.label" cols="12" class="pa-0 pb-5">
              <auto-complete-field ref="firstInput" v-model="glassModel[item.id]" v-bind="item" />
            </v-col>
            <v-col cols="12" md="6" class="px-1 pr-md-5 py-0">
              <single-eye-input
                v-bind="odEye"
                eye-name="OD"
                :add-enabled="glassModel['glassesType'] === 'multifocal'"
                @update:modelValue="
                  (e) => {
                    odEye[e.id] = e.value
                  }
                "
              />
            </v-col>
            <v-col cols="12" md="6" class="px-1 pl-md-5 py-0">
              <single-eye-input
                v-bind="osEye"
                eye-name="OS"
                :add-enabled="glassModel['glassesType'] === 'multifocal'"
                @update:modelValue="
                  (e) => {
                    updateSync(osEye, e.value)
                    osEye[e.id] = e.value
                  }
                "
              />
            </v-col>
            <v-col cols="12" class="px-0 pt-0">
              <div class="pb-3 text-body-2 text--secondary">
                You are in {{ locationNames[reimsSite] }} ({{ freeSlots }} SKUs left)
              </div>
              <div class="d-flex">
                <v-btn
                  v-prevent-enter-tab
                  :disabled="!valid || loading"
                  color="primary"
                  class="mr-4"
                  type="submit"
                  :loading="loading"
                  @click="submit"
                >
                  <span class="text-decoration-underline">A</span>dd glasses
                </v-btn>
                <v-btn v-prevent-enter-tab class="mr-4" plain tabindex="-1" @click="reset">
                  Clear form
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
      <v-col
        v-if="lastAdded.length > 0"
        ref="results"
        cols="12"
        md="4"
        lg="3"
        class="pl-md-6 pt-3 pt-md-2"
      >
        <div class="text-h6 pb-2">Recently added</div>
        <glass-card
          v-for="(item, idx) in lastAdded.slice(0, 3)"
          :key="item.id"
          :glass="item"
          :style="'opacity: ' + (1 - idx * 0.3)"
          editable
        >
          <template #actions>
            <delete-button
              :glass="item"
              fixed-reason="WRONGLY_ADDED"
              @delete="submitDeletion(item.sku)"
            />
          </template>
        </glass-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'pinia'
import {
  generalEyeData,
  sanitizeEyeValues,
  clearObjectProperties,
  reimsSiteNames as locationNames,
} from '@/lib/util'
import { ModifiedEnterToTabMixin } from '@/plugins/vue-enter-to-tab'
import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'
import AutoCompleteField from '@/components/AutoCompleteField.vue'
import SingleEyeInput from '@/components/SingleEyeInput.vue'
import GlassCard from '@/components/GlassCard.vue'
import DeleteButton from '@/components/DeleteButton.vue'

export default {
  mixins: [ModifiedEnterToTabMixin],
  components: { AutoCompleteField, SingleEyeInput, GlassCard, DeleteButton },
  transition: 'main',
  setup() {
    const glassesStore = useGlassesStore()
    const rootStore = useRootStore()
    return {
      glassesStore,
      rootStore,
      allGlasses: rootStore.allGlasses,
    }
  },
  data: () => ({
    valid: false,
    loading: false,
    glassModel: {},
    odEye: { axis: '', cylinder: '', sphere: '', add: '' },
    osEye: { axis: '', cylinder: '', sphere: '', add: '' },
    syncEyes: true,
    output: '',
    generalEyeData,
    eyes: [
      {
        text: 'OD',
        key: 'od',
      },
      {
        text: 'OS',
        key: 'os',
      },
    ],
    lastAddedSkus: [],
    locationNames,
  }),
  head() {
    return {
      title: 'Add glasses',
    }
  },
  computed: {
    ...mapState(useRootStore, ['drawer', 'reimsSite']),
    lastAdded() {
      return this.lastAddedSkus.map((sku) => this.allGlasses.find((g) => g.sku === sku))
    },
    freeSlots() {
      // TODO for the future don't hardcode 5000
      return 5000 - this.allGlasses.length
    },
  },
  watch: {
    'odEye.add'(newVal) {
      // set using vue function to trigger reactive system in SingleEyeInput
      if (this.syncEyes) this.$set(this.osEye, 'add', newVal)
    },
    allGlasses() {
      this.lastAddedSkus = this.lastAddedSkus.filter((sku) =>
        this.allGlasses.find((g) => g.sku === sku),
      )
    },
  },
  methods: {
    async submit() {
      if (!this.valid) return
      this.loading = true
      this.glassModel.od = sanitizeEyeValues(this.odEye)
      this.glassModel.os = sanitizeEyeValues(this.osEye)
      try {
        const newGlasses = await this.glassesStore.addGlasses(this.glassModel)
        this.lastAddedSkus.unshift(newGlasses.sku)
      } catch (error) {
        this.loading = false
        if (error.status === 409) {
          // no free skus left.
          this.rootStore.setError(error.message)
        } else {
          this.rootStore.setError(`Could not add glasses, please retry (${error.status})`)
        }
        return
      }
      this.loading = false
      this.rootStore.clearError()
      this.reset()
      // scroll to bottom on mobile
      this.$nextTick(() => {
        if (this.rootStore.isMobile) this.$refs.results.scrollIntoView(true)
      })
    },
    reset() {
      clearObjectProperties(this.odEye)
      clearObjectProperties(this.osEye)
      this.glassModel = {}
      this.$refs.form.reset()
      if (!this.rootStore.isMobile) this.$refs.firstInput[0].focus()
      this.syncEyes = true
    },
    updateSync(oldEye, newValue) {
      if (oldEye.add !== newValue) this.syncEyes = false
    },
    async submitDeletion(sku) {
      try {
        await this.glassesStore.deleteGlasses({ sku, reason: 'WRONGLY_ADDED' })
      } catch (error) {
        if (error.status === 404) {
          console.log('Already deleted')
        } else {
          this.rootStore.setError(`Could not delete glasses, please retry (Error ${error.status})`)
        }
      }
    },
  },
  title: 'Add glasses',
}
</script>
