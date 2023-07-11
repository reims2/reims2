<template>
  <v-dialog v-model="deleteDialog" width="500">
    <template #activator="{ props }">
      <v-btn variant="text" v-bind="props"> Delete </v-btn>
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
        <v-btn variant="text" @click="deleteDialog = false"> Cancel </v-btn>
        <v-btn color="error" variant="text" @click="startDelete"> Confirm deletion </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  glass: {
    type: Object,
    required: true,
  },
  fixedReason: {
    type: String,
    default: null,
    required: false,
  },
})
const emit = defineEmits(['delete'])

const deleteDialog = ref(false)
const deleteReason = ref('TOO_HIGH_VALUES') // preselect most common reason for doing mass removals
const reasons = ref([
  { title: 'Glasses have too high values', value: 'TOO_HIGH_VALUES' },
  { title: 'Not found in storage', value: 'NOT_FOUND' },
  { title: 'Glasses damaged / broken', value: 'BROKEN' },
  { title: 'Other reason', value: 'OTHER' },
  // can only be selected via this.fixedReason
  // { title: 'Wrongly added', value: 'WRONGLY_ADDED' },
])

function startDelete() {
  deleteDialog.value = false
  emit('delete', !props.fixedReason ? deleteReason.value : null)
}
</script>
