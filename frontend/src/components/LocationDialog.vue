<template>
  <v-dialog
    :model-value="modelValue"
    max-width="400px"
    persistent
    @update:modelValue="(e) => updateDialogState(e)"
  >
    <v-card>
      <v-card-title class="text-h5 white--text primary">Change location</v-card-title>

      <v-card-text>
        <v-select v-model="newLocation" :items="locations" class="mt-5" />
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
import { ref } from 'vue'

const rootStore = useRootStore()
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const newLocation = ref<ReimsSite | null>(null)
const locations = [
  { title: 'San Miguel', value: 'sm' },
  { title: 'Santa Ana', value: 'sa' },
]
// initial value
newLocation.value = rootStore.reimsSite

async function changeLocation() {
  if (!newLocation.value) return
  loading.value = true
  const prevLocation = rootStore.reimsSite
  rootStore.reimsSite = newLocation.value

  try {
    await rootStore.loadGlasses()
  } catch (error) {
    // reset location
    newLocation.value = prevLocation
    rootStore.reimsSite = prevLocation

    rootStore.setError(`Cannot change location (Error ${error.status})`)
  }

  loading.value = false
  // close dialog and save
  updateDialogState(false)
}
function updateDialogState(value: boolean) {
  emit('update:modelValue', value)
  newLocation.value = rootStore.reimsSite
}
</script>
