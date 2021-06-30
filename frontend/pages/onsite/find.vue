<template>
  <v-container fluid>
    <v-row dense class="justify-center">
      <v-col cols=12 md=6>
        <v-form ref="form" v-model="valid" @submit.prevent>
          <v-row dense>
            <v-col
              cols="12"
              class="py-0 px-4 "
            >
              <v-autocomplete
                ref="firstInput"
                v-model="glassesType"
                :items="type_data.options"
                :label="type_data.label"
                :rules="type_data.rules"
                auto-select-first
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
                :add-enabled="glassesType !== 'single'"
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
                :add-enabled="glassesType !== 'single'"
                @input="e => {os_eye = e; sync_eye = false}"
              />
            </v-col>
            <v-col cols=12 class="pt-4">
              <div>
                <div>These are not real matches yet!</div>
                <v-btn
                  :disabled="!valid"
                  color="primary"
                  class="mr-4"
                  type="submit"
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
      <v-col cols=12 md=4 lg=3 class="pl-0 pl-md-6">
        <div v-if="matches.length == 0" class="text--secondary">
          Enter prescription to display matches
        </div>
        <div v-else>
          <glass-card
            v-for="item in matches.slice(3*(page-1),3*(page-1)+3)"
            :key="item.sku"
            :glass="item"
          />
          <div class="text-center">
            <v-pagination
              v-model="page"
              :length="3"
              circle
            />
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data: () => ({
    valid: false,
    page: 1,
    glassesType: '',
    os_eye: {},
    od_eye: {},
    sync_eye: true,
    type_data:
      {
        label: 'Type',
        options: [{
          text: 'single vision',
          value: 'single'
        }, {
          text: 'multifocal',
          value: 'multi'
        }],
        rules: [v => !!v || 'Item is required']
      }
  }),
  computed: {
    ...mapState({
      matches: state => state.glasses.matches
    })
  },
  watch: {
    od_eye() {
      if (this.sync_eye) {
        console.log('u')
        this.$set(this.os_eye, 'add', this.od_eye.add)
      }
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
      // this.$nuxt.$loading.start()
      const eyeModel = {}
      eyeModel.glassesType = this.glassesType
      eyeModel.os = this.os_eye
      eyeModel.od = this.od_eye
      this.philScore(eyeModel)
      this.page = 1
      setTimeout(() => { this.$refs.firstInput.focus() })
      this.sync_eye = true
    },
    reset() {
      this.$refs.form.reset()
      this.philScore({})
      setTimeout(() => { this.$refs.firstInput.focus() })
      this.sync_eye = true
    }
  },
  title: 'Find glasses'
}
</script>
