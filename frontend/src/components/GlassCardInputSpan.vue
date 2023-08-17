<template>
  <v-text-field
    v-if="props.isEditing"
    :model-value="model"
    :rules="props.rules"
    density="compact"
    variant="underlined"
    single-line
    hide-details
    style="max-width: 60px"
    class="pb-1 prevent-enter-tab"
    autofocus
    @update:model-value="model = $event"
    @keyup.enter="submit"
    @update:focused="focusChanged"
  />
  <span v-else>{{ props.modelValue }} {{ props.suffix }}</span>
</template>

<script setup lang="ts">
import { isValidForRules } from '@/util/glasses-utils'
import { ValidationRule } from '@/model/ReimsModel'

interface Props {
  modelValue: string
  isEditing: boolean
  suffix?: string
  rules: ValidationRule[]
}

const props = withDefaults(defineProps<Props>(), {
  suffix: '',
})

const emit = defineEmits(['update:modelValue', 'blur'])

const model = ref('')
watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      // Update on external changes (for example on DB update)
      model.value = newValue
    }
  },
  { immediate: true },
)

function submit() {
  if (!isValidForRules(model.value, props.rules)) return
  emit('update:modelValue', model.value)
}
function focusChanged(val: boolean) {
  if (!val) emit('blur')
}
</script>
