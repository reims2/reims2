<template>
  <v-container fluid>
    <v-row class="justify-center" dense>
      <v-col cols=12 md=6 lg=4>
        <v-form ref="form" v-model="valid" @submit.prevent>
          <v-row dense>
            <v-col
              v-for="item in general_data"
              :key="item.label"
              cols="12"
              class="py-0 px-4 "
            >
              <v-autocomplete
                ref="firstInput"
                v-model="glass_model[item.id]"
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
                v-model="od_eye"
                eye-name="OD"
                :add-enabled="glass_model['glassesType'] !== 'single'"
              />
            </v-col>
            <v-col
              cols=12
              md=6
              class="px-4 pt-4"
            >
              <single-eye-input
                :value="os_eye"
                eye-name="OS"
                :add-enabled="glass_model['glassesType'] !== 'single'"
                @input="e => {os_eye = e; sync_eye = false}"
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
import { mapState, mapActions } from 'vuex'
export default {
  data: () => ({
    valid: false,
    glass_model: {},
    os_eye: {},
    od_eye: {},
    sync_eye: true,
    output: '',
    general_data: [
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
    od_eye() {
      if (this.sync_eye) {
        // setting manually to trigger reactive system in SingleEyeInput
        this.$set(this.os_eye, 'add', this.od_eye.add)
      }
    },
    lastAdded: {
      handler() {
        // reset on successful load
        this.reset()
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
    submit() {
      if (this.valid) {
        this.$nuxt.$loading.start()

        this.glass_model.sku = Math.floor(Math.random() * 10000) // fixme this is just for testing
        const newOd = {}
        const newOs = {}
        for (const key of Object.keys(this.od_eye)) {
          // copy to new object (thanks js) and convert to Number at once
          newOd[key] = Number(this.od_eye[key])
          newOs[key] = Number(this.os_eye[key])
        }
        this.glass_model.od = newOd
        this.glass_model.os = newOs
        this.addGlasses(this.glass_model)
      }
    },
    reset() {
      this.os_eye = {}
      this.od_eye = {}
      this.glass_model = {}
      this.$refs.form.reset()
      this.$refs.firstInput[0].focus()
      this.sync_eye = true
    },
    generate_hint(options) {
      return 'One of ' + options.join(', ')
    },
    updateDeleted(item) {
      const index = this.lastAdded.indexOf(item)
      console.log(index)
      // todo this is an vuex object, make this logic better if (index > -1) this.lastAdded.splice(index, 1)
    }
  },
  title: 'Enter glasses'
}
</script>
