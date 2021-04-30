<template>
  <v-container style="max-width: 800px;">
    <v-form ref="form" v-model="valid">
      <v-container>
        <v-row dense>
          <v-col
            cols="12"
            class="py-0 px-4 "
          >
            <v-autocomplete
              v-model="glass_type"
              :items="type_data.options"
              :label="type_data.label"
              :rules="type_data.rules"
              auto-select-first
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
              :add-enabled="glass_type !== 'single'"
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
    glass_type: '',
    eye_model: {},
    output: '',
    type_data:
      {
        id: 'type',
        label: 'Type',
        options: ['single', 'bifocal', 'progressive'],
        rules: [v => !!v || 'Item is required']
      }
  }),
  methods: {
    submit () {
      this.output = this.glass_type + ' ' + JSON.stringify(this.eye_model)
    },
    reset () {
      this.$refs.form.reset()
      this.output = ''
    },
    update_eye (model, eye) {
      this.eye_model[eye] = model;
    }
  },
  title: 'Find glasses'
}
</script>
