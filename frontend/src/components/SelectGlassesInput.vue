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

const input = useTemplateRef('input')

watch(
  () => sku.value,
  async (newSku) => {
    if (newSku == null || isNaN(newSku)) {
      emit('change', null)
      return
    }
    errorMessage.value = ''
    emit('change', glassesStore.getGlassLocal(newSku))
    // also fetch glasses in background to update database
    try {
      const fetched = await glassesStore.fetchSingle(newSku)
      // the SKU may have been cleared while fetching
      if (sku.value === newSku) emit('change', fetched)
    } catch {
      // the local DB cache was already emitted
    }
  },
  // A pre-flush emit changes the parent's state mid-patch, its slots then render past their v-if.
  { flush: 'post' },
)

watch(
  () => glassesStore.allGlasses,
  () => emit('change', sku.value == null ? null : glassesStore.getGlassLocal(sku.value)),
)

function focus() {
  input.value?.focus()
}
defineExpose({ focus })
</script>
