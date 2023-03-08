<template>
  <v-container>
    <v-row dense class="justify-center">
      <v-col cols=12 md=6 lg=4>
        <div class="text--secondary pb-2">
          Start by entering a SKU to dispense or edit glasses.
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
                :autofocus="!$vuetify.breakpoint.mobile"
                label="SKU"
                type="number"
                :hint="hint"
                persistent-hint
                :loading="isLoading"
                :error-messages="errorMesssage"
                :success-messages="successMessage"
                outlined
              />
            </v-col>
            <v-col v-if="selected">
              <div class="d-flex flex-shrink-1 justify-start">
                <glass-card :key="selected.key" :glass="selected" editable>
                  <template #actions>
                    <v-btn
                      text
                      class="mx-0"
                      @click="submitDispension"
                    >
                      Dispense
                    </v-btn>
                    <div class="d-flex flex-grow-1 justify-end">
                      <v-menu offset-y left>
                        <template #activator="{ on, attrs }">
                          <v-btn
                            icon
                            v-bind="attrs"
                            v-on="on"
                          >
                            <v-icon> {{ mdiDotsVertical }} </v-icon>
                          </v-btn>
                        </template>
                        <v-list dense>
                          <v-list-item>
                            <delete-button :glass="selected" @delete="reason => submitDeletion(reason)" />
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </template>
                </glass-card>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <v-snackbar
      v-if="snackbarMessage != ''"
      :value=true
      :timeout="-1"
      vertical
      absolute
      bottom
    >
      <template #action="{ attrs }">
        <v-btn
          v-if="lastDispensed != null"
          text
          v-bind="attrs"
          @click="undoDispension(lastDispensed)"
        >
          Undo
        </v-btn>
        <v-btn
          text
          v-bind="attrs"
          color="primary lighten-3"
          @click="snackbarMessage = ''"
        >
          Close
        </v-btn>
      </template>
      <span>{{ snackbarMessage }}</span>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mdiDotsVertical } from '@mdi/js'
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
export default {
  transition: 'main',
  data: () => ({
    valid: false,
    sku: '',
    lastDispensed: null,
    isLoading: false,
    snackbarMessage: '',
    successMessage: '',
    errorMesssage: '',
    isOfflineDispension: false,
    mdiDotsVertical
  }),
  head() {
    return {
      title: 'Edit glasses'
    }
  },
  title: 'Edit glasses',
  computed: {
    ...mapState({
      glasses: state => state.allGlasses
    }),
    ...mapGetters({
      getSingle: 'glasses/getSingle'
    }),
    selected() {
      const selected = this.getSingle(parseInt(this.sku))
      // horrible hack to always refresh the virtual DOM if something changed
      if (selected) selected.key = '' + selected.sku + Math.floor(Math.random() * 10000).toString()
      return selected
    },
    hint() {
      if (this.selected) {
        return 'Press ENTER to dispense'
      } else if (this.sku == null || this.sku === '') {
        return ''
      } else {
        return 'SKU not found'
      }
    }
  },
  watch: {
    sku() {
      if (this.sku != null && this.sku !== '') {
        this.successMessage = ''
        // also fetch glasses in background to update database
        this.$store.dispatch('glasses/fetchSingle', this.sku)
      }
      this.errorMesssage = ''
    }
  },
  activated() {
    if (this.$route.query.sku) {
      this.$nextTick(() => {
        this.sku = this.$route.query.sku
      })
    }
  },
  methods: {
    ...mapActions({
      dispense: 'glasses/dispense',
      undispense: 'glasses/undispense'
    }),
    ...mapMutations({
      deleteOfflineGlasses: 'deleteOfflineGlasses'
    }),
    async submitDispension() {
      await this.submitDeletion('DISPENSED')
    },
    async submitDeletion(reason) {
      if (this.isLoading || this.sku == null || this.sku === '') return
      if (!this.selected) {
        this.errorMesssage = 'SKU not found'
        return
      }
      // copy object because the computed `selected` property will get null when it's dispensed
      const toDispense = this.selected
      // do dispension
      this.snackbarMessage = ''
      this.errorMesssage = ''
      this.isLoading = true
      this.lastDispensed = null
      try {
        await this.dispense({ sku: toDispense.sku, reason })
      } catch (error) {
        this.isLoading = false
        if (error.status === 404) {
          this.$store.commit('setError', 'SKU ' + toDispense.sku + ' not found on server, was it already dispensed?')
        } else if (error.network || error.server) {
          if (error.server) {
            this.$store.commit('setError', `Server error. But the glasses will be automatically dispensed as soon as the server is reachable (Error ${error.status})`)
            this.snackbarMessage = `Glasses with SKU ${toDispense.sku} will be dispensed when the server is back online`
            this.deleteOfflineGlasses(toDispense.sku)
          } else {
            this.snackbarMessage = `Glasses with SKU ${toDispense.sku} will be dispensed when you're back online`
          }
          this.lastDispensed = toDispense
          this.$refs.form.reset()
          this.$refs.firstInput.focus()
        } else {
          this.$store.commit('setError', `Could not dispense glasses, please retry (Error ${error.status})`)
        }
        return
      }
      this.isLoading = false
      this.lastDispensed = toDispense
      if (reason === 'DISPENSED') {
        this.snackbarMessage = `Successfully dispensed glasses with SKU ${toDispense.sku}`
        this.successMessage = 'Dispension successful'
      } else {
        this.snackbarMessage = `Successfully deleted glasses with SKU ${toDispense.sku}`
      }
      this.$refs.form.reset()
      this.$refs.firstInput.focus()
    },
    async undoDispension(glasses) {
      this.isLoading = true
      try {
        await this.undispense(glasses)
      } catch (error) {
        this.isLoading = false
        if (error.status === 400) {
          this.$store.commit('setError', `Sorry, reverting the dispension is not possible. Please readd glasses manually (Error ${error.status}).`)
          this.snackbarMessage = ''
        } else if (error.network || error.server) {
          this.$store.commit('setError', 'Network or server error. Dispension will be automatically reverted as soon as you\'re back online.')
          this.snackbarMessage = ''
        } else {
          this.$store.commit('setError', `Could not undo dispension of glasses, please retry (Error ${error.status}).`)
        }
        return
      }
      this.isLoading = false
      this.lastDispensed = null
      this.sku = glasses.sku
      this.snackbarMessage = `Reverted dispension/deletion of SKU ${glasses.sku} successfully`
    }
  }
}
</script>
