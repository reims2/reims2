<template>
  <v-dialog
    :model-value="isOpen"
    max-width="400px"
    persistent
    @update:model-value="(e) => updateDialogState(e)"
  >
    <v-card>
      <v-toolbar color="primary" title="Change location"></v-toolbar>

      <v-card-text>
        <v-select v-model="newLocation" :items="reimsSiteSelects" class="mt-2" />
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="updateDialogState(false)">Close</v-btn>
        <v-btn
          color="primary"
          variant="text"
          :loading="loading"
          :disabled="newLocation == rootStore.reimsSite"
          @click="changeLocation"
        >
          Apply
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ReimsSite } from '@/model/ReimsModel'
import { useRootStore } from '@/stores/root'
import { useGlassesStore } from '@/stores/glasses'
import { useToast } from 'vue-toastification'
import { reimsSiteSelects } from '@/util/util'

const toast = useToast()
const rootStore = useRootStore()
const glassesStore = useGlassesStore()

const isOpen = defineModel<boolean>('modelValue', { required: true })
const loading = ref(false)
const newLocation = ref<ReimsSite | null>(null)

// initial value
newLocation.value = rootStore.reimsSite

async function changeLocation() {
  if (!newLocation.value) return
  loading.value = true
  const prevLocation = rootStore.reimsSite
  rootStore.reimsSite = newLocation.value

  try {
    await glassesStore.loadGlasses()
  } catch (error) {
    // reset location
    newLocation.value = prevLocation
    rootStore.reimsSite = prevLocation

    toast.error(`Cannot change location (${error.message})`)
    return
  } finally {
    loading.value = false
    // close dialog and save
    updateDialogState(false)
  }
}
function updateDialogState(value: boolean) {
  isOpen.value = value
  newLocation.value = rootStore.reimsSite
}
</script>
