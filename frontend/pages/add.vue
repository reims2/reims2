<template>
  <v-container>
    <v-row class="justify-center" dense>
      <v-col cols=12 md=6 lg=4 class="pb-2 px-2 pt-4">
        <v-form ref="form" v-model="valid" @submit.prevent>
          <v-row dense>
            <v-col
              v-for="item in generalEyeData"
              :key="item.label"
              cols="12"
              class="pa-0"
            >
              <v-autocomplete
                ref="firstInput"
                v-model="glassModel[item.id]"
                :items="item.items"
                :label="item.label"
                :rules="item.rules"
                auto-select-first
                persistent-hint
                :autofocus="item.first && !$vuetify.breakpoint.mobile"
                outlined
              />
            </v-col>
            <v-col
              cols=12
              md=6
              class="px-1 pr-md-5 pt-0"
            >
              <single-eye-input
                v-model="odEye"
                eye-name="OD"
                :add-enabled="glassModel['glassesType'] !== 'single'"
              />
            </v-col>
            <v-col
              cols=12
              md=6
              class="px-1 pl-md-5 pt-0"
            >
              <single-eye-input
                :value="osEye"
                eye-name="OS"
                :add-enabled="glassModel['glassesType'] !== 'single'"
                @input="e => {updateSync(osEye, e); osEye = e}"
              />
            </v-col>
            <v-col cols=12 class="px-0">
              <div class="d-flex">
                <v-btn
                  :disabled="!valid || loading"
                  color="primary"
                  class="mr-4"
                  type="submit"
                  :loading="loading"
                  @click="submit"
                >
                  Add glasses
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
import { generalEyeData } from '~/lib/util'
export default {
  transition: 'main',
  data: () => ({
    valid: false,
    loading: false,
    glassModel: {},
    osEye: {},
    odEye: {},
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
    odEye() {
      if (this.syncEyes) {
        // setting manually to trigger reactive system in SingleEyeInput
        this.$set(this.osEye, 'add', this.odEye.add)
      }
    }
  },
  methods: {
    ...mapActions({
      addGlasses: 'glasses/addGlasses'
    }),
    async submit() {
      if (this.valid) {
        this.loading = true
        const newOd = {}
        const newOs = {}
        for (const key of Object.keys(this.odEye)) {
          // copy to new object (thanks js) and convert to Number at once
          newOd[key] = Number(this.odEye[key])
          newOs[key] = Number(this.osEye[key])
        }
        this.glassModel.od = newOd
        this.glassModel.os = newOs
        try {
          const newGlasses = await this.addGlasses(this.glassModel)
          this.lastAdded.unshift(newGlasses)
        } catch (error) {
          this.loading = false
          this.$store.commit('setError', `Could not add glasses, please retry (${error.status})`)
          return
        }
        this.loading = false
        this.$store.commit('clearError')
        this.reset()
        // scroll to bottom on mobile
        this.$nextTick(() => { if (this.$vuetify.breakpoint.mobile) this.$refs.results.scrollIntoView(true) })
      }
    },
    reset() {
      this.osEye = {}
      this.odEye = {}
      this.glassModel = {}
      this.$refs.form.reset()
      if (!this.$vuetify.breakpoint.mobile) this.$refs.firstInput[0].focus()
      this.syncEyes = true // todo add some kind of UI (sync icon) for right eye
    },
    updateDeleted(toRemove) {
      this.lastAdded = this.lastAdded.filter(itm => itm !== toRemove)
    },
    updateLastAdded(updatedGlasses) {
      this.lastAdded = this.lastAdded.map(el => (el.sku === updatedGlasses.sku ? updatedGlasses : el))
    },
    updateSync(oldEye, newEye) {
      if (oldEye.add !== newEye.add) this.syncEyes = false
    }
  },
  title: 'Enter glasses'
}
</script>
