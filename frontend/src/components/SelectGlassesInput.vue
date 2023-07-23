<template>
  <v-text-field
    :model-value="props.sku"
    :autofocus="!mobile"
    label="SKU"
    type="number"
    :hint="hint"
    persistent-hint
    :loading="props.loading"
    :error-messages="props.errorMesssage"
    @update:model-value="(val) => emit('update:sku', parseInt(val))"
  />
</template>

<script setup lang="ts">
import { useGlassesStore } from '@/stores/glasses'
import { Glasses } from '@/model/GlassesModel'

import { useDisplay } from 'vuetify'

const emit = defineEmits<{
  change: [glasses: Glasses | null]
  'update:sku': [sku: number | null]
  'update:error-message': [message: string]
}>()

const props = withDefaults(
  defineProps<{
    loading: boolean
    sku: number | null
    errorMesssage?: string
    hintForSelected?: string
  }>(),
  {
    errorMesssage: '',
    hintForSelected: '',
  },
)

const { mobile } = useDisplay()
const glassesStore = useGlassesStore()

const hint = ref('')
const selected = ref<Glasses | null>(null)

watch(
  () => props.sku,
  async () => {
    if (props.sku != null && !isNaN(props.sku)) {
      emit('update:error-message', '')
      selected.value = glassesStore.getGlassLocal(props.sku)
      emit('change', selected.value)
      if (!selected.value) hint.value = ''
      // also fetch glasses in background to update database
      selected.value = await glassesStore.fetchSingle(props.sku)
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
    if (props.sku == null) selected.value = null
    else selected.value = glassesStore.getGlassLocal(props.sku)
    emit('change', selected.value)
  },
)

watch(selected, () => {
  if (selected.value) {
    hint.value = props.hintForSelected
  }
})
</script>
