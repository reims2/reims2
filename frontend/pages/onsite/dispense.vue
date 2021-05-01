<template>
  <v-container fluid>
    <v-row dense class="justify-center">
      <v-col cols=12 md=6>
        <v-form
          ref="form"
          v-model="valid"
          @submit.prevent="submit"
        >
          <v-row dense>
            <v-col
              cols="12"
              class="py-0 px-4 "
            >
              <v-text-field
                v-model="sku"
                label="SKU to dispense"
                :rules="sku_rules"
              />
              <div>
                {{ selected }}
              </div>
              <div v-if="result" class="text-body-2">
                {{ result }}
              </div>
              <v-btn
                :disabled="!valid"
                color="primary"
                class="mr-4"
                @click="submit"
              >
                Dispense glasses
              </v-btn>
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
    result: null,
    sku_rules: [
      v => !isNaN(v) || 'SKU must be numeric'
    ]
  }),
  computed: {
    ...mapState({
      glasses: state => state.glasses.glasses
    }),
    selected() {
      return this.glasses.filter(el => el.SKU === this.sku)[0]
    }
  },
  methods: {
    submit() {
      if (this.selected) {
        // do dispension
        this.result = 'Successfully dispensed glasses with SKU ' + this.selected.SKU
        this.$refs.form.reset()
      } else {
        this.result = 'SKU not found'
      }
    }
  }
}
</script>
