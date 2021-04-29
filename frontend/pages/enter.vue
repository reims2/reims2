<template>
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
            v-model="item.model"
            :items="item.options"
            :label="item.label"
            :rules="item.rules"
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
          <v-row dense>
            <div class="text-h6">
              {{ eye }}
            </div>
            <v-col
              v-for="item in eye_data"
              :key="item.label"
              cols="12"
              class="py-0 pl-0"
            >
              <v-text-field
                v-model="eye_model[eye][item.label]"
                :label="item.label"
                :rules="eye_rules"
              />
            </v-col>
            <v-col cols="12" class="py-0 pl-0">
              <v-text-field
                v-model="eye_model[eye]['Add']"
                label="Add"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols=12 class="pt-4">
          <v-btn
            :disabled="!valid"
            color="success"
            class="mr-4"
          >
            Add glasses
          </v-btn>
          <v-btn
            class="mr-4"
            @click="reset"
          >
            Reset Form
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
  data: () => ({
    valid: false,
    glass_type: '',
    size: '',
    appearance: '',
    material: '',
    eye_model: { OS: {}, OD: {} },
    general_data: [
      {
        label: 'Type',
        options: ['single', 'bifocal', 'progressive'],
        rules: [v => !!v || 'Item is required']
      },
      {
        label: 'Size',
        options: ['small', 'medium', 'large', 'child'],
        rules: [v => !!v || 'Item is required']
      },
      {
        label: 'Appearance',
        options: ['neutral', 'feminine', 'masculine'],
        rules: [v => !!v || 'Item is required']
      },
      {
        label: 'Material',
        options: ['metal', 'plastic']
      }
    ],
    eye_rules: [
      v => !isNaN(v) || 'Item must be numeric',
      v => (v >= -20 && v <= 20) || 'Item out of range',
      v => !!v || 'Item is required'
    ],
    eye_data: [
      {
        label: 'Sphere'
      },
      {
        label: 'Cylinder'
      },
      {
        label: 'Axis'
      }
    ]
  }),
  methods: {
    reset () {
      this.$refs.form.reset()
    }
  },
  title: 'Enter glasses'
}
</script>
