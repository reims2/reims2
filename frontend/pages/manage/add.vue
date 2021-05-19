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
              v-for="eye in eyes"
              :key="eye.key"
              cols=12
              md=6
              class="px-4 pt-4"
            >
              <single-eye-input
                :eye-name="eye.text"
                :add-enabled="glass_model['glassesType'] !== 'single'"
                @update="model => {update_eye(model, eye.key)}"
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
            <v-btn
              text
              color="error"
            >
              Remove
            </v-btn>
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
    eye_model: {},
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
  activated() {
    setTimeout(() => { this.$refs.firstInput[0].focus() })
  },
  methods: {
    ...mapActions({
      addGlasses: 'glasses/addGlasses'
    }),
    submit() {
      if (this.valid) {
        this.glass_model.sku = Math.floor(Math.random() * 10000)
        // fixme this is a very weird workaround, thanks js
        this.glass_model.od = Object.assign({}, this.eye_model.od)
        this.glass_model.os = Object.assign({}, this.eye_model.os)
        this.addGlasses(this.glass_model)
        this.reset()
      }
    },
    reset() {
      this.eye_model = {}
      this.glass_model = {}
      this.$refs.form.reset()
      this.$refs.firstInput[0].focus()
    },
    update_eye(model, eye) {
      this.eye_model[eye] = model
    },
    generate_hint(options) {
      return 'One of ' + options.join(', ')
    }
  },
  title: 'Enter glasses'
}
</script>
