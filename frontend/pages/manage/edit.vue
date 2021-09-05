<template>
  <v-container fluid>
    <v-row dense class="justify-center">
      <v-col cols=12 md=6 lg=4>
        <div class="pb-2 text--secondary">
          You can edit or delete glasses here.
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
                autofocus
                label="SKU"
                type="number"
                :hint="hint"
                persistent-hint
                :loading="isLoading"
                :error-messages="errorMessage"
                @input="search(sku)"
              />
            </v-col>
            <v-col v-if="selected">
              <div class="d-flex flex-shrink-1 justify-start">
                <glass-card :glass="selected" editable @edited="glasses => selected=glasses">
                  <template #actions>
                    <delete-button :glass="selected" @deleted="updatedDeleted" />
                  </template>
                </glass-card>
              </div>
              <div class="text--secondary pt-2">
                You can edit all values by clicking on them.
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <v-snackbar v-if="result != ''" :value=true :timeout="-1" bottom>
      <template #action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="result = ''"
        >
          Close
        </v-btn>
      </template>
      {{ result }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data: () => ({
    valid: false,
    sku: '',
    result: '',
    selected: null,
    errorMessage: '',
    isLoading: false
  }),
  computed: {
    ...mapState({
      glasses: state => state.allGlasses
    }),
    hint() {
      if (this.isLoading) {
        return ''
      } else if (this.selected) {
        return 'Click value to edit'
      } else if (this.sku == null || this.sku === '') {
        return 'Enter SKU to continue'
      } else {
        return 'SKU not found'
      }
    }
  },
  methods: {
    submit() {
      if (!this.selected) this.errorMessage = 'SKU not found'
    },
    async search(sku) {
      this.errorMessage = ''
      this.selected = null
      if (sku == null || sku === '') return
      this.isLoading = true
      try {
        this.selected = await this.$store.dispatch('glasses/fetchSingle', sku)
        this.result = ''
      } catch (error) {
        if (this.$axios.isCancel(error)) {
          // request was cancelled, ignore and return so we don't disable loading bar down below
          return
        } else if (error.response && error.response.status < 500) {
          // SKU doesn't exist or client side error, don't display anything
          this.selected = null
        } else if (this.glasses) {
          // Network or server error, fallback to stored database
          this.selected = this.glasses.filter(el => Number(el.sku) === this.sku)[0]
          this.result = `Could not load glasses from server (${error.status}), falling back to local database.`
        } else {
          // no stored database and network or server error
          this.errorMessage = 'Could not load glasses'
          this.$store.commit('setError', `Could not load glasses with SKU ${sku} from server (${error.status}), please retry!`)
        }
      }
      this.isLoading = false
    },
    updatedDeleted() {
      this.result = 'Successfully deleted glasses with SKU ' + this.selected.sku
      this.$refs.form.reset()
      this.$refs.firstInput.focus()
    }
  }
}
</script>
