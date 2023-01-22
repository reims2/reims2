<template>
  <v-container @keyup.a="submit">
    <v-row class="justify-center" dense>
      <v-col cols=12 md=6 lg=4 class="pb-2 px-2 pt-4">
        <v-form ref="form" v-model="valid" @submit.prevent>
          <v-row dense>
            <v-col
              v-for="item in generalEyeData"
              :key="item.label"
              cols="12"
              class="pa-0 py-2"
            >
              <v-text-field
                ref="firstInput"
                v-model="glassModel[item.id]"
                :label="item.label"
                :rules="item.rules"
                :hint="item.hint"
                :autofocus="item.first && !$vuetify.breakpoint.mobile"
                outlined
                clearable
                hide-details="auto"
                @keyup.a="() => {return true}"
                @blur="autoComplete(item.id)"
                @focus="$event.target.select()"
              />
            </v-col>
            <v-col
              cols=12
              md=6
              class="px-1 pr-md-5 pt-0"
            >
              <single-eye-input
                v-bind="odEye"
                eye-name="OD"
                :add-enabled="glassModel['glassesType'] === 'multifocal'"
                @input="e => {odEye[e.id] = e.value}"
              />
            </v-col>
            <v-col
              cols=12
              md=6
              class="px-1 pl-md-5 pt-0"
            >
              <single-eye-input
                v-bind="osEye"
                eye-name="OS"
                :add-enabled="glassModel['glassesType'] === 'multifocal'"
                @input="e => {updateSync(osEye, e.value); osEye[e.id] = e.value}"
              />
            </v-col>
            <v-col cols=12 class="px-0">
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
        v-if="lastAdded.length > 0"
        ref="results"
        cols=12
        md=4
        lg=3
        class="pl-md-6 pt-3 pt-md-2"
      >
        <div class="text-h6 pb-2">
          Recently added
        </div>
        <glass-card
          v-for="(item, idx) in lastAdded.slice(0,3)"
          :key="item.id"
          :glass="item"
          :style="'opacity: ' + (1-idx*0.3)"
          editable
          @edited="glasses => updateLastAdded(glasses)"
        >
          <template #actions>
            <delete-button :glass="item" @deleted="updateDeleted(item)" />
          </template>
        </glass-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { generalEyeData, sanitizeEyeValues, clearObjectProperties, completeGlassesData } from '../lib/util'
import { ModifiedEnterToTabMixin } from '@/plugins/vue-enter-to-tab'
export default {
  mixins: [ModifiedEnterToTabMixin],
  transition: 'main',
  data: () => ({
    valid: false,
    loading: false,
    glassModel: {},
    odEye: { axis: '', cylinder: '', sphere: '', add: '' },
    osEye: { axis: '', cylinder: '', sphere: '', add: '' },
    syncEyes: true,
    output: '',
    generalEyeData,
    eyes: [{
      text: 'OD',
      key: 'od'
    },
    {
      text: 'OS',
      key: 'os'
    }],
    lastAdded: []
  }),
  head() {
    return {
      title: 'Add glasses'
    }
  },
  watch: {
    'odEye.add'(newVal) {
      // set using vue function to trigger reactive system in SingleEyeInput
      if (this.syncEyes) this.$set(this.osEye, 'add', newVal)
    }
  },
  methods: {
    ...mapActions({
      addGlasses: 'glasses/addGlasses'
    }),
    async submit() {
      if (!this.valid) return
      this.loading = true
      this.glassModel.od = sanitizeEyeValues(this.odEye)
      this.glassModel.os = sanitizeEyeValues(this.osEye)
      try {
        const newGlasses = await this.addGlasses(this.glassModel)
        this.lastAdded.unshift(newGlasses)
      } catch (error) {
        this.loading = false
        if (error.status === 409) {
          // no free skus left.
          this.$store.commit('setError', error.message)
        } else {
          this.$store.commit('setError', `Could not add glasses, please retry (${error.status})`)
        }
        return
      }
      this.loading = false
      this.$store.commit('clearError')
      this.reset()
      // scroll to bottom on mobile
      this.$nextTick(() => { if (this.$vuetify.breakpoint.mobile) this.$refs.results.scrollIntoView(true) })
    },
    reset() {
      clearObjectProperties(this.odEye)
      clearObjectProperties(this.osEye)
      this.glassModel = {}
      this.$refs.form.reset()
      if (!this.$vuetify.breakpoint.mobile) this.$refs.firstInput[0].focus()
      this.syncEyes = true
    },
    updateDeleted(toRemove) {
      this.lastAdded = this.lastAdded.filter(itm => itm !== toRemove)
    },
    updateLastAdded(updatedGlasses) {
      this.lastAdded = this.lastAdded.map(el => (el.sku === updatedGlasses.sku ? updatedGlasses : el))
    },
    updateSync(oldEye, newValue) {
      if (oldEye.add !== newValue) this.syncEyes = false
    },
    autoComplete(id) {
      this.glassModel[id] = completeGlassesData(this.glassModel[id], id)
    }
  },
  title: 'Add glasses'
}
</script>
