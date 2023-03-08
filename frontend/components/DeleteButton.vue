<template>
  <v-dialog
    v-model="deleteDialog"
    width="500"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        text
        v-bind="attrs"
        v-on="on"
      >
        Delete
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="headline white--text primary mb-4">
        Delete glasses
      </v-card-title>
      <v-card-text class="text--primary pb-0">
        <div class="pb-3">
          This will delete the glasses with SKU {{ glass.sku }}. Please select a reason, which is later visible in campaign reports.
        </div>
        <v-select
          v-model="deleteReason"
          :items="reasons"
          outlined
        />
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
import { mapActions, mapMutations } from 'vuex'
export default {
  props: {
    glass: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    deleteDialog: false,
    deleteReason: 'TOO_HIGH_VALUES', // preselect most common reason for doing mass removals
    reasons: [
      { text: 'Glasses have too high values', value: 'TOO_HIGH_VALUES' },
      { text: 'Not found in storage', value: 'NOT_FOUND' },
      { text: 'Glasses damaged / broken', value: 'BROKEN' },
      { text: 'Wrongly added', value: 'WRONGLY_ADDED' },
      { text: 'Other reason', value: 'OTHER' }
    ]
  }),
  methods: {
    ...mapActions({
      deleteGlasses: 'glasses/dispense'
    }),
    ...mapMutations({
      deleteOfflineGlasses: 'deleteOfflineGlasses'
    }),
    async startDelete() {
      this.deleteDialog = false
      try {
        await this.deleteGlasses({ sku: this.glass.sku, reason: this.deleteReason })
        this.$emit('deleted')
        // Delete glasses from local DB manually after emit. Otherwise the emit action is not executed in any parent component,
        // because the (parent) glasses component containing this component is already removed due to reactive system
        this.deleteOfflineGlasses(this.glass.sku)
      } catch (error) {
        this.$store.commit('setError', `Could not delete glasses, please retry (Error ${error.status})`)
      }
    }
  }
}
</script>
