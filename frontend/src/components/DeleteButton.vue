<template>
  <v-dialog v-model="deleteDialog" width="500">
    <template #activator="{ props: activatorProps }">
      <v-btn variant="text" v-bind="activatorProps">Delete</v-btn>
    </template>
    <v-card>
      <v-toolbar color="primary" title="Delete glasses"></v-toolbar>
      <v-card-text class="text-high-emphasis pb-0">
        <div class="pb-3">
          Glasses with SKU {{ glass.sku }} will be deleted.
          <span v-if="!fixedReason">
            Please select a reason. This is later visible in campaign reports.
          </span>
        </div>
        <v-select v-if="!fixedReason" v-model="deleteReason" :items="reasons" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
        <v-btn color="error" variant="text" @click="startDelete">Confirm deletion</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { Glasses } from '@/model/GlassesModel'
import { DeletionReason } from '@/model/ReimsModel'

const props = withDefaults(defineProps<{ glass: Glasses; fixedReason?: DeletionReason | null }>(), {
  fixedReason: null,
})

const emit = defineEmits(['delete'])

const deleteDialog = ref(false)
const deleteReason = ref<DeletionReason>('TOO_HIGH_VALUES') // preselect most common reason for doing mass removals
const reasons: Ref<{ title: string; value: DeletionReason }[]> = ref([
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
