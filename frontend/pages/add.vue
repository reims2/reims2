<template>
  <v-container style="max-width: 800px;">
    <v-form ref="form" v-model="valid">
      <v-container>
        <v-row dense>
          <v-col
            v-for="item in general_data"
            :key="item.label"
            cols="12"
            class="py-0 px-4 "
          >
            <v-autocomplete
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
            v-for="eye in ['OD', 'OS']"
            :key="eye"
            cols=12
            md=6
            class="px-4 pt-4"
          >
            <single-eye-input
              :eye-name="eye"
              :add-enabled="glass_model['type'] !== 'single'"
              @update="model => {update_eye(model, eye)}"
            />
          </v-col>
          <v-col cols=12 class="pt-4">
            <div class="d-flex">
              <v-btn
                :disabled="!valid"
                color="primary"
                class="mr-4"
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
          <v-col cols=12>
            <div>{{ output }}</div>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    valid: false,
    glass_model: {},
    eye_model: {},
    output: '',
    general_data: [
      {
        id: 'type',
        label: 'Type',
        options: ['single', 'bifocal', 'progressive'],
        rules: [v => !!v || 'Item is required']
      },
      {
        id: 'size',
        label: 'Size',
        options: ['small', 'medium', 'large', 'child'],
        rules: [v => !!v || 'Item is required']
      },
      {
        id: 'appearance',
        label: 'Appearance',
        options: ['neutral', 'feminine', 'masculine'],
        rules: [v => !!v || 'Item is required']
      },
      {
        id: 'material',
        label: 'Material',
        options: ['metal', 'plastic']
      }
    ]
  }),
  methods: {
    submit() {
      this.output = JSON.stringify(this.glass_model) + JSON.stringify(this.eye_model)
    },
    reset() {
      this.$refs.form.reset()
      this.output = ''
    },
    update_eye(model, eye) {
      this.eye_model[eye] = model;
    },
    generate_hint(options) {
      return 'One of ' + options.join(', ');
    }
  },
  title: 'Enter glasses'
}
</script>
