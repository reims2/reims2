<template>
  <v-text-field
    ref="input"
    :model-value="sku"
    :autofocus="!mobile"
    label="SKU"
    type="number"
    hide-spin-buttons
    :hint="hint"
    persistent-hint
    :loading="loading"
    :error-messages="errorMessage"
    @update:model-value="(val) => (sku = parseInt(val))"
  />
</template>

<script setup lang="ts">
import { useGlassesStore } from '@/stores/glasses'
import { Glasses } from '@/model/GlassesModel'

import { useDisplay } from 'vuetify'

const emit = defineEmits<{
  change: [glasses: Glasses | null]
}>()

const { hint = '' } = defineProps<{
  loading: boolean
  hint?: string
}>()

const sku = defineModel<number | null>('sku', { required: true })
const errorMessage = defineModel<string>('errorMessage', { default: '' })

const { mobile } = useDisplay()
const glassesStore = useGlassesStore()

const selected = ref<Glasses | null>(null)
const input = useTemplateRef('input')

watch(
  () => sku.value,
  async (newSku) => {
    if (newSku != null && !isNaN(newSku)) {
      errorMessage.value = ''
      selected.value = glassesStore.getGlassLocal(newSku)
      emit('change', selected.value)
      // also fetch glasses in background to update database
      try {
        selected.value = await glassesStore.fetchSingle(newSku)
      } catch {
        // do nothing, we fallback to local DB cache
      }
    } else {
      selected.value = null
    }
    emit('change', selected.value)
  },
  // A pre-flush emit changes the parent's state mid-patch, its slots then render past their v-if.
  { flush: 'post' },
)

watch(
  () => glassesStore.allGlasses,
  () => {
    if (sku.value == null) selected.value = null
    else selected.value = glassesStore.getGlassLocal(sku.value)
    emit('change', selected.value)
  },
)

function focus() {
  input.value?.focus()
}
defineExpose({ focus })
</script>
