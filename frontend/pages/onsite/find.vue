<template>
  <v-container fluid>
    <v-row dense class="justify-center">
      <v-col cols=12 md=6>
        <v-form ref="form" v-model="valid" @submit.prevent="submit">
          <v-row dense>
            <v-col
              cols="12"
              class="py-0 px-4 "
            >
              <v-autocomplete
                ref="firstInput"
                v-model="eye_model[type_data.id]"
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
                :add-enabled="eye_model[type_data.id] !== 'single'"
                @update="model => {update_eye(model, eye)}"
              />
            </v-col>
            <v-col cols=12 class="pt-4">
              <div>
                <div>These are not real matches yet!</div>
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
      <v-col cols=12 md=4 class="pl-6">
        <div v-if="matches.length == 0" class="text--secondary">
          Enter prescription to display matches
        </div>
        <glass-card
          v-for="item in matches.slice().sort((a,b)=> (a.score > b.score ? 1 : -1)).slice(0,5)"
          :key="item.SKU"
          :glass="item"
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
    eye_model: {},
    type_data:
      {
        id: 'type',
        label: 'Type',
        options: ['single', 'bifocal', 'progressive'],
        rules: [v => !!v || 'Item is required']
      }
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
        } else {
          this.philScore({})
        }
      },
      deep: true
    }
  },
  activated() {
    setTimeout(() => { this.$refs.firstInput.focus() })
  },
  methods: {
    ...mapActions({
      philScore: 'glasses/philScore'
    }),
    submit() {
      this.philScore(this.eye_model)
      setTimeout(() => { this.$refs.firstInput.focus() })
    },
    reset() {
      this.$refs.form.reset()
      setTimeout(() => { this.$refs.firstInput.focus() })
    },
    update_eye(model, eye) {
      this.eye_model[eye] = model
    }
  },
  title: 'Find glasses'
}
</script>
