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
        // do dispension
        this.$nuxt.$loading.start()
        this.result = 'Dispensing glasses with SKU ' + this.selected.sku + '...'
        try {
          await this.dispense(this.selected.sku)
        } catch (error) {
          this.result = ''
          if (!error.handled) {
            if (error.response.status === 404) {
              this.result = 'SKU ' + this.selected.sku + ' not found, was it already dispensed?'
            }
          } else if (error.response == null) {
            this.result = 'Network error, glasses are NOT dispensed. Please retry later!'
          }
          return
        }
        this.result = 'Successfully dispensed glasses with SKU ' + this.selected.sku
        this.$refs.form.reset()
        this.$refs.firstInput.focus()
      } else {
        this.result = 'SKU not found'
      }
    }
  }
}
</script>
