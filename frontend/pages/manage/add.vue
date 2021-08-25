<template>
  <v-container fluid>
    <v-row class="justify-center" dense>
      <v-col cols=12 md=6 lg=4>
        <v-form ref="form" v-model="valid" @submit.prevent>
          <v-row dense>
            <v-col
              v-for="item in generalData"
              :key="item.label"
              cols="12"
              class="py-0 px-4 "
            >
              <v-autocomplete
                ref="firstInput"
                v-model="glassModel[item.id]"
                :items="item.options"
                :label="item.label"
                :rules="item.rules"
                auto-select-first
                :hint="generate_hint(item.options)"
                persistent-hint
              />
            </v-col>
            <v-col
              cols=12
              md=6
              class="px-4 pt-4"
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
              class="px-4 pt-4"
            >
              <single-eye-input
                :value="osEye"
                eye-name="OS"
                :add-enabled="glassModel['glassesType'] !== 'single'"
                @input="e => {updateSync(osEye, e); osEye = e}"
              />
            </v-col>
            <v-col cols=12 class="pt-4">
              <div class="d-flex">
                <v-btn
                  :disabled="!valid"
                  color="primary"
                  class="mr-4"
                  type="submit"
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
      <v-col v-if="lastAdded.length > 0" cols=12 md=4 lg=3 class="pl-0 pl-md-6">
        <div class="text-h6 pb-2">
          Recently added
        </div>
        <glass-card
          v-for="(item, idx) in lastAdded.slice(0,3)"
          :key="item.sku || 1"
          :glass="item"
          :style="'opacity: ' + (1-idx*0.3)"
        >
          <template #actions>
            <delete-button :glass="item" @deleted="updateDeleted(item)" />
            <v-btn
              text
              color="primary"
            >
              Edit
            </v-btn>
          </template>
        </glass-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
export default {
  data: () => ({
    valid: false,
    glassModel: {},
    osEye: {},
    odEye: {},
    syncEyes: true,
    output: '',
    generalData: [
      {
        id: 'glassesType',
        label: 'Type',
        options: ['single', 'bifocal', 'progressive'],
        rules: [v => !!v || 'Item is required'],
        first: true
      },
      {
        id: 'glassesSize',
        label: 'Size',
        options: ['small', 'medium', 'large', 'child'],
        rules: [v => !!v || 'Item is required']
      },
      {
        id: 'appearance',
        label: 'Appearance',
        options: ['neutral', 'feminine', 'masculine'],
        rules: [v => !!v || 'Item is required']
      }
    ],
    eyes: [{
      text: 'OD',
      key: 'od'
    },
    {
      text: 'OS',
      key: 'os'
    }]
  }),
  computed: {
    ...mapState({
      lastAdded: state => state.glasses.lastAdded
    })
  },
  watch: {
    odEye() {
      if (this.syncEyes) {
        // setting manually to trigger reactive system in SingleEyeInput
        this.$set(this.osEye, 'add', this.odEye.add)
      }
    },
    lastAdded: {
      handler() {
        // reset on successful load
        // this.reset() // todo readd
      },
      deep: true
    }
  },
  activated() {
    // jump to first field if we switch back to this UI
    setTimeout(() => { this.$refs.firstInput[0].focus() })
  },
  methods: {
    ...mapActions({
      addGlasses: 'glasses/addGlasses'
    }),
    ...mapMutations({
      removeFromLastAdded: 'glasses/removeFromLastAdded'
    }),
    submit() {
      if (this.valid) {
        this.$nuxt.$loading.start()

        this.glassModel.sku = Math.floor(Math.random() * 10000) // fixme this is just for testing
        const newOd = {}
        const newOs = {}
        for (const key of Object.keys(this.odEye)) {
          // copy to new object (thanks js) and convert to Number at once
          newOd[key] = Number(this.odEye[key])
          newOs[key] = Number(this.osEye[key])
        }
        this.glassModel.od = newOd
        this.glassModel.os = newOs
        this.addGlasses(this.glassModel)
      }
    },
    reset() {
      this.osEye = {}
      this.odEye = {}
      this.glassModel = {}
      this.$refs.form.reset()
      this.$refs.firstInput[0].focus()
      this.syncEyes = true
    },
    generate_hint(options) {
      return 'One of ' + options.join(', ')
    },
    updateDeleted(item) {
      this.removeFromLastAdded(item.sku)
    },
    updateSync(oldEye, newEye) {
      if (oldEye.add !== newEye.add) this.syncEyes = false
    }
  },
  title: 'Enter glasses'
}
</script>
