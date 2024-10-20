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
    :error-messages="errorMesssage"
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
const errorMessage = defineModel<string>('errorMesssage', { default: '' })

const { mobile } = useDisplay()
const glassesStore = useGlassesStore()

const hint = ref('')
const selected = ref<Glasses | null>(null)
const input = useTemplateRef('input')

watch(
  () => sku.value,
  async (newSku) => {
    if (newSku != null && !isNaN(newSku)) {
      errorMessage.value = ''
      selected.value = glassesStore.getGlassLocal(newSku)
      emit('change', selected.value)
      if (!selected.value) hint.value = ''
      // also fetch glasses in background to update database
      try {
        selected.value = await glassesStore.fetchSingle(newSku)
      } catch (error) {
        // do nothing, we fallback to local DB cache
      }
    } else {
      selected.value = null
      hint.value = ''
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

watchEffect(() => {
  if (selected.value) {
    hint.value = hintForSelected
  }
})

function focus() {
  input.value?.focus()
}
defineExpose({ focus })
</script>
