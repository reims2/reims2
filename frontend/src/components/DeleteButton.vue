<template>
  <v-dialog v-model="deleteDialog" width="500">
    <template #activator="{ props }">
      <v-btn text v-bind="props"> Delete </v-btn>
    </template>
    <v-card>
      <v-card-title class="headline white--text primary mb-4"> Delete glasses </v-card-title>
      <v-card-text class="text--primary pb-0">
        <div class="pb-3">
          This will delete the glasses with SKU {{ glass.sku }}.
          <span v-if="!fixedReason"
            >Please select a reason, which is later visible in campaign reports.</span
          >
        </div>
        <v-select v-if="!fixedReason" v-model="deleteReason" :items="reasons" outlined />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="deleteDialog = false"> Cancel </v-btn>
        <v-btn color="error" text @click="startDelete"> Confirm deletion </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    glass: {
      type: Object,
      required: true,
    },
    fixedReason: {
      type: String,
      default: null,
      required: false,
    },
  },
  data: () => ({
    deleteDialog: false,
    deleteReason: 'TOO_HIGH_VALUES', // preselect most common reason for doing mass removals
    reasons: [
      { text: 'Glasses have too high values', value: 'TOO_HIGH_VALUES' },
      { text: 'Not found in storage', value: 'NOT_FOUND' },
      { text: 'Glasses damaged / broken', value: 'BROKEN' },
      { text: 'Other reason', value: 'OTHER' },
      // can only be selected via this.fixedReason
      // { text: 'Wrongly added', value: 'WRONGLY_ADDED' },
    ],
  }),
  methods: {
    startDelete() {
      this.deleteDialog = false
      this.$emit('delete', !this.fixedReason ? this.deleteReason : null)
    },
  },
}
</script>
