<template>
  <v-container fluid>
    <v-row dense class="justify-center">
      <v-col cols=12 md=6 lg=4>
        <div class="pb-3 text--secondary">
          You can edit or delete glasses here. Input the SKU to continue.
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
                <glass-card v-if="selected" :glass="selected">
                  <template #actions>
                    <v-btn
                      text
                      color="error"
                      @click="startDelete"
                    >
                      Remove
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="edit"
                    >
                      Edit
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
    ...mapActions({
      deleteGlasses: 'glasses/delete'
    }),
    edit() {
      if (this.selected) {
        // todo do edit
        this.result = 'NOT IMPLEMENTED: Edited glasses with SKU ' + this.selected.sku
        this.$refs.form.reset()
        this.$refs.firstInput.focus()
      } else {
        this.result = 'SKU not found'
      }
    },
    submit() {
      if (this.selected) {
        // todo
      } else {
        this.result = 'SKU not found'
      }
    },
    startDelete() {
      // todo some confirmation dialog
      this.deleteGlasses(this.selected.id)
      this.result = 'Successfully deleted glasses with SKU ' + this.selected.sku
      this.$refs.form.reset()
      this.$refs.firstInput.focus()
    }
  }
}
</script>
