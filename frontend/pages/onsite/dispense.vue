<template>
  <v-container fluid>
    <v-row dense class="justify-center">
      <v-col cols=12 md=6 lg=4>
        <div class="pb-3 text--secondary">
          You can dispense glasses here. Input the SKU to continue.
        </div>
        <v-form
          ref="form"
          v-model="valid"
          @submit.prevent="submit"
        >
          <v-row>
            <v-col cols=12>
              <v-text-field
                ref="firstInput"
                v-model.number="sku"
                label="SKU"
                type="number"
                :hint="selected? 'Press ENTER to dispense' : null"
                persistent-hint
              />
            </v-col>
            <v-col v-if="result" cols=12 class="pt-0">
              <div class="text-body-2">
                {{ result }}
              </div>
            </v-col>
            <v-col>
              <div class="d-flex flex-shrink-1 justify-start">
                <glass-card v-if="selected" :glass="selected">
                  <template #actions>
                    <v-btn
                      text
                      color="primary"
                      @click="submit"
                    >
                      Dispense
                    </v-btn>
                  </template>
                </glass-card>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  data: () => ({
    valid: false,
    sku: '',
    result: null
  }),
  computed: {
    ...mapState({
      glasses: state => state.allGlasses
    }),
    selected() {
      return this.glasses.filter(el => Number(el.sku) === this.sku)[0] // todo replace with getter in store
    }
  },
  activated() {
    setTimeout(() => { this.$refs.firstInput.focus() })
  },
  methods: {
    ...mapActions({
      dispense: 'glasses/dispense'
    }),
    async submit() {
      if (this.selected) {
        const skuToDispense = this.selected.sku
        // do dispension
        this.$nuxt.$loading.start()
        this.result = 'Dispensing glasses with SKU ' + skuToDispense + '...'
        try {
          await this.dispense(skuToDispense)
        } catch (error) {
          this.result = ''
          if (error.status === 404) {
            this.result = 'SKU ' + skuToDispense + ' not found, was it already dispensed?'
          } else if (error.response == null) {
            this.result = 'Network error. Dispension will be retried as soon as you\'re back online.'
          } else if (!error.handled) {
            this.$store.commit('setError', `Could not dispense glasses, please retry (${error.status})`)
          }
          return
        }
        this.$refs.form.reset()
        this.$refs.firstInput.focus()
        this.result = 'Successfully dispensed glasses with SKU ' + skuToDispense
      } else {
        this.result = 'SKU not found'
      }
    }
  }
}
</script>
