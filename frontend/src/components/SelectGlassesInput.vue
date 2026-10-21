<template>
  <v-text-field
    ref="input"
    :model-value="sku"
    :autofocus="!mobile"
    label="SKU"
    type="number"
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

const { hintForSelected = '' } = defineProps<{
  loading: boolean
  hintForSelected?: string
}>()

const sku = defineModel<number | null>('sku', { required: true })
const errorMessage = defineModel<string>('errorMessage', { default: '' })

const { mobile } = useDisplay()
const glassesStore = useGlassesStore()

const selected = ref<Glasses | null>(null)
const input = useTemplateRef('input')
const hint = computed(() => (selected.value ? hintForSelected : ''))

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
