<template>
  <v-container fluid>
    <v-row dense class="justify-center">
      <v-col cols=12 md=6 lg=4>
        <div class="text--secondary">
          You can dispense glasses here.
        </div>
        <v-form
          ref="form"
          v-model="valid"
          class="pt-3"
          @submit.prevent="submitDispension"
        >
          <v-row>
            <v-col cols=12>
              <v-text-field
                ref="firstInput"
                v-model.number="sku"
                autofocus
                label="SKU"
                type="number"
                :hint="hint"
                persistent-hint
                :loading="isLoading"
                :error-messages="errorMesssage"
                :success-messages="successMessage"
              />
            </v-col>
            <v-col>
              <div class="d-flex flex-shrink-1 justify-start">
                <glass-card v-if="selected" :glass="selected">
                  <template #actions>
                    <v-btn
                      text
                      color="primary"
                      @click="submitDispension"
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
    <v-snackbar v-if="lastDispensed != null" :value=true :timeout="-1" bottom>
      <template #action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          color="error"
          @click="undoDispension(lastDispensed)"
        >
          Undo
        </v-btn>
        <v-btn
          text
          v-bind="attrs"
          @click="lastDispensed = null"
        >
          Close
        </v-btn>
      </template>
      <span v-if="networkOffline">Glasses with SKU {{ lastDispensed.sku }} will be dispensed when you're back online</span>
      <span v-else>Successfully dispensed glasses with SKU {{ lastDispensed.sku }}</span>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  data: () => ({
    valid: false,
    sku: '',
    lastDispensed: null,
    isLoading: false,
    successMessage: [],
    errorMesssage: [],
    networkOffline: false
  }),
  computed: {
    ...mapState({
      glasses: state => state.allGlasses
    }),
    selected() {
      return this.glasses.filter(el => this.sku && el.sku === this.sku)[0] // todo replace with getter in store
    },
    hint() {
      if (this.selected) {
        return 'Press ENTER to dispense'
      } else if (this.sku == null || this.sku === '') {
        return 'Enter SKU to continue'
      } else {
        return 'SKU not found'
      }
    }
  },
  watch: {
    sku() {
      if (this.sku != null && this.sku !== '') this.successMessage = []
      this.errorMesssage = []
    }
  },
  methods: {
    ...mapActions({
      dispense: 'glasses/dispense',
      undispense: 'glasses/undispense'
    }),
    async submitDispension() {
      if (this.isLoading || this.sku == null || this.sku === '') return
      if (!this.selected) {
        this.errorMesssage = 'SKU not found'
        return
      }
      // copy object because the computed `selected` property will get null when it's dispensed
      const toDispense = this.selected
      // do dispension
      this.successMessage = []
      this.errorMesssage = []
      this.isLoading = true
      this.lastDispensed = null
      this.networkOffline = false
      try {
        await this.dispense(toDispense.sku)
      } catch (error) {
        this.isLoading = false
        if (error.status === 404) {
          this.$store.commit('setError', 'SKU ' + toDispense.sku + ' not found on server, was it already dispensed?')
        } else if (error.response == null) {
          this.networkOffline = true
          // this.$store.commit('setError', 'Network error. Dispension will be automatically retried as soon as you\'re back online.')
          // fixme it must be possible to undo here
        } else if (!error.handled) {
          this.$store.commit('setError', `Could not dispense glasses, please retry (${error.status})`)
        }
        return
      }
      this.isLoading = false
      this.lastDispensed = toDispense
      this.successMessage = 'Dispension successful'
      this.$refs.form.reset()
      this.$refs.firstInput.focus()
    },
    async undoDispension(glasses) {
      try {
        await this.undispense(glasses)
      } catch (error) {
        if (error.status === 400) {
          this.$store.commit('setError', `Sorry, reverting the dispension is not possible. Please readd glasses manually (Error ${error.status}).`)
          this.lastDispensed = null
        } else if (error.response == null) {
          this.$store.commit('setError', 'Network error. Dispension will be automatically reverted as soon as you\'re back online.')
        } else {
          this.$store.commit('setError', `Could not undo dispension of glasses, please retry (Error ${error.status}).`)
        }
        return
      }
      this.lastDispensed = null
      this.successMessage = 'Reverted dispension successfully'
    }
  }
}
</script>
