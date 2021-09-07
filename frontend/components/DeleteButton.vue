<template>
  <v-dialog
    v-model="deleteDialog"
    width="500"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        text
        color="error"
        v-bind="attrs"
        v-on="on"
      >
        Delete
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="headline">
        Are you sure you?
      </v-card-title>
      <v-card-text class="text--primary red--text">
        This will permanently delete the glasses (SKU {{ glass.sku }}) and cannot be reverted.
        <span class="font-weight-bold">Only use this if the glasses have been entered by mistake.</span>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="deleteDialog = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          text
          @click="startDelete"
        >
          Confirm deletion
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  props: {
    glass: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    deleteDialog: false
  }),
  methods: {
    ...mapActions({
      deleteGlasses: 'glasses/delete'
    }),
    async startDelete() {
      this.deleteDialog = false
      try {
        await this.deleteGlasses(this.glass.sku)
        this.$emit('deleted')
      } catch (error) {
        this.$store.commit('setError', `Could not delete glasses, please retry (${error.status})`)
      }
    }
  }
}
</script>
