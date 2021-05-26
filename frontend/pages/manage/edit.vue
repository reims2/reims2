<template>
  <v-container fluid>
    <v-row dense class="justify-center">
      <v-col cols=12 md=6 lg=4>
        <div class="pb-3 text--secondary">
          You can edit, delete or dispense glasses here. Input the SKU to continue.
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
              />
            </v-col>
            <v-col v-if="result" cols=12 class="pt-0">
              <div class="text-body-2">
                {{ result }}
              </div>
            </v-col>
            <v-col>
              <div class="d-flex flex-shrink-1 justify-start">
                <glass-card v-if="selected" :glass="selected" @dispense="submit" />
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data: () => ({
    valid: false,
    sku: '',
    result: null
  }),
  computed: {
    ...mapState({
      glasses: state => state.glasses.allGlasses
    }),
    selected() {
      return this.glasses.filter(el => Number(el.sku) === this.sku)[0]
    }
  },
  activated() {
    setTimeout(() => { this.$refs.firstInput.focus() })
  },
  methods: {
    submit() {
      if (this.selected) {
        // do dispension
        this.result = 'NOT IMPLEMENTED: Successfully edited glasses with SKU ' + this.selected.sku
        this.$refs.form.reset()
        this.$refs.firstInput.focus()
      } else {
        this.result = 'SKU not found'
      }
    }
  }
}
</script>
