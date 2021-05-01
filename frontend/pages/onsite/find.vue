<template>
  <v-container fluid>
    <v-row dense class="justify-center">
      <v-col cols=12 md=6>
        <v-form ref="form" v-model="valid">
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
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <v-row v-if="matches.length > 0" dense class="mt-4">
      <v-col>
        These are not real matches yet!
        <v-data-table
          :headers="headers"
          :items="matches"
          :items-per-page="5"
          dense
          hide-default-footer
          disable-filtering
          sort-by="score"
          must-sort
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  data: () => ({
    valid: false,
    glass_type: '',
    eye_model: {},
    type_data:
      {
        id: 'type',
        label: 'Type',
        options: ['single', 'bifocal', 'progressive'],
        rules: [v => !!v || 'Item is required']
      },
    headers: [
      { value: 'SKU', text: 'SKU' },
      { value: 'score', text: 'PHIL SCORE' },
      { value: 'TYPE', text: 'TYPE' },
      { value: 'ODSPHERE', text: 'OD SPHERE' },
      { value: 'ODCYLINDER', text: 'OD CYLINDER' },
      { value: 'ODAXIS', text: 'OD AXIS' },
      { value: 'ODADD', text: 'OD ADD' },
      { value: 'OSSPHERE', text: 'OS SPHERE' },
      { value: 'OSCYLINDER', text: 'OS CYLINDER' },
      { value: 'OSAXIS', text: 'OS AXIS' },
      { value: 'OSADD', text: 'OS ADD' },
      { value: 'GENDER', text: 'GENDER' },
      { value: 'MATERIAL', text: 'MATERIAL' },
      { value: 'SIZE', text: 'SIZE' }
    ]
  }),
  computed: {
    ...mapState({
      matches: state => state.glasses.matches
    })
  },
  watch: {
    eye_model: {
      handler(val) {
        if (this.valid) {
          this.philScore(val)
        }
      },
      deep: true
    }
  },
  methods: {
    ...mapActions({
      philScore: 'glasses/philScore'
    }),
    submit() {
      this.philScore(this.eye_model)
    },
    reset() {
      this.$refs.form.reset()
    },
    update_eye(model, eye) {
      this.eye_model[eye] = model
    }
  },
  title: 'Find glasses'
}
</script>
