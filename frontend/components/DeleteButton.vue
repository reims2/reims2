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
        Remove
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="headline">
        Are you sure you?
      </v-card-title>
      <v-card-text class="text--primary red--text">
        This will permanently delete SKU {{ glass.sku }}.
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
    startDelete() {
      this.deleteDialog = false
      this.deleteGlasses(this.glass.id)
      this.$emit('deleted')
    }
  }
}
</script>
