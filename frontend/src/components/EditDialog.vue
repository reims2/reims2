<template>
  <v-dialog v-model="dialogOpen" max-width="640">
    <v-form ref="form" v-model="valid" @submit.prevent>
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-title-large font-weight-semibold">
          Editing SKU {{ glassesInput.sku }}
        </v-card-title>
        <v-card-text class="pt-4">
          <glass-input v-model="glassesInput"></glass-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-prevent-enter-tab
            variant="text"
            class="text-medium-emphasis"
            tabindex="-1"
            @click="dialogOpen = false"
          >
            Cancel
          </v-btn>
          <v-btn
            v-prevent-enter-tab
            variant="tonal"
            color="primary"
            :disabled="!valid"
            :loading="loading"
            @click="updateGlasses()"
          >
            Save changes
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
import { useToast } from '@/composables/toast'
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
    if (error instanceof ReimsAxiosError && error.isNetwork) {
      toast.error(`Glasses will be automatically edited as soon as the connection is back.`)
      // no return here, we act like it's successful
    } else {
      toast.error(`Glasses can't be edited (${(error as Error).message}). Please retry later`)
      return
    }
  } finally {
    loading.value = false
  }
  dialogOpen.value = false
}
</script>
