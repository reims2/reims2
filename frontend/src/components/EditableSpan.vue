<template>
  <v-text-field
    v-if="props.isEditing"
    :model-value="props.modelValue"
    :rules="rules"
    density="compact"
    variant="underlined"
    single-line
    hide-details
    style="max-width: 60px"
    class="pb-1 prevent-enter-tab"
    autofocus
    @update:model-value="model = $event"
    @update:error="(val: boolean) => (hasError = val)"
    @keyup.enter="submit"
    @update:focused="focusChanged"
  />
  <span v-else>{{ props.modelValue }} {{ props.suffix }}</span>
</template>

<script setup lang="ts">
import { ValidationRule } from '@/model/ReimsModel'

interface Props {
  modelValue: string
  isEditing: boolean
  suffix: string
  rules: ValidationRule[]
}

const props = withDefaults(defineProps<Props>(), {
  suffix: '',
})

const emit = defineEmits(['update:modelValue', 'blur'])

const hasError = ref(false)

const model = ref('')
watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      // Update on external changes (for example on DB update)
      model.value = newValue
    }
  },
)

function submit() {
  if (!hasError.value) {
    emit('update:modelValue', model.value)
  }
}
function focusChanged(val: boolean) {
  if (!val) {
    emit('blur')
  }
}
</script>
