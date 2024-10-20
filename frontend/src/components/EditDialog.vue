<template>
  <v-dialog v-model="dialogOpen" width="500">
    <v-form ref="form" v-model="valid" @submit.prevent>
      <v-card>
        <v-toolbar color="primary" :title="`Editing SKU ${glassesInput.sku}`"></v-toolbar>
        <v-card-text>
          <glass-input v-model="glassesInput"></glass-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn v-prevent-enter-tab variant="text" tabindex="-1" @click="dialogOpen = false">
            Cancel
          </v-btn>
          <v-btn
            v-prevent-enter-tab
            variant="text"
            color="primary"
            :disabled="!valid"
            :loading="loading"
            @click="updateGlasses()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { DisplayedGlasses, Glasses } from '@/model/GlassesModel'
import GlassInput from '@/components/GlassInput.vue'
import { useGlassesStore } from '@/stores/glasses'
import { ReimsAxiosError } from '@/lib/axios'
import { useToast } from 'vue-toastification'
import { sanitizeEyeValues } from '@/util/eye-utils'
import { formatGlassesForDisplay } from '@/util/format-glasses'
import { useEnterToTab } from 'vue3-enter-to-tab'

const glassesStore = useGlassesStore()
const toast = useToast()

const dialogOpen = defineModel<boolean>('open', { required: true })
const originalGlasses = defineModel<Glasses>('glasses', { required: true })

const glassesInput: Ref<DisplayedGlasses> = ref(
  formatGlassesForDisplay(originalGlasses.value, false),
)
const valid = ref(true)
const loading = ref(false)
const form = useTemplateRef('form')
const { vPreventEnterTab } = useEnterToTab(form)

watch(dialogOpen, (open) => {
  if (open) glassesInput.value = formatGlassesForDisplay(originalGlasses.value, false)
})

async function updateGlasses() {
  const newGlasses = {
    ...originalGlasses.value,
    glassesType: glassesInput.value.glassesType,
    glassesSize: glassesInput.value.glassesSize,
    appearance: glassesInput.value.appearance,
    od: sanitizeEyeValues(glassesInput.value.od),
    os: sanitizeEyeValues(glassesInput.value.os),
  }
  try {
    loading.value = true
    const returnedGlasses = await glassesStore.editGlasses(newGlasses)
    originalGlasses.value = returnedGlasses
  } catch (error) {
    if (error instanceof ReimsAxiosError && (error.isServerSide || error.isNetwork)) {
      toast.error(`Glasses will be automatically edited as soon as the connection is back.`)
      // no return here, we act like it's successful
    } else {
      toast.error(`Glasses can't be edited (${error.message}). Please retry later`)
      return
    }
  } finally {
    loading.value = false
  }
  dialogOpen.value = false
}
</script>
