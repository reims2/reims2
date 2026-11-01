<template>
  <v-dialog v-model="deleteDialog" width="500">
    <template #activator="{ props: activatorProps }">
      <v-btn variant="text" :prepend-icon="mdiDeleteOutline" v-bind="activatorProps">Delete</v-btn>
    </template>
    <v-card rounded="xl" class="pa-2">
      <v-card-title class="text-title-large font-weight-semibold">
        Delete SKU {{ formatSku(glass.sku) }}
      </v-card-title>
      <v-card-text class="pb-0">
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
        <v-btn variant="text" class="text-medium-emphasis" @click="deleteDialog = false">
          Cancel
        </v-btn>
        <v-btn color="error" variant="tonal" :prepend-icon="mdiDeleteOutline" @click="startDelete">
          Confirm deletion
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { mdiDeleteOutline } from '@mdi/js'
import { Glasses } from '@/model/GlassesModel'
import { formatSku } from '@/util/format-glasses'
import { DeletionReason } from '@/model/ReimsModel'

const { fixedReason = null } = defineProps<{
  glass: Glasses
  fixedReason?: DeletionReason | null
}>()

const emit = defineEmits<{
  delete: [DeletionReason | null]
}>()

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
  emit('delete', !fixedReason ? deleteReason.value : null)
}
</script>
