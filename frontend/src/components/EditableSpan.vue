<template>
  <v-text-field
    v-if="isEditing"
    v-model="model"
    :rules="rules"
    dense
    single-line
    hide-details
    style="max-width: 60px"
    class="pb-1 prevent-enter-tab"
    autofocus
    @update:error="(val: boolean) => (hasError = val)"
    @keyup.enter="submit"
    @blur="$emit('blur')"
  />
  <span v-else>{{ modelValue }} {{ suffix }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type ValidationRule = (v: any) => boolean | string
interface Props {
  modelValue: string
  isEditing: boolean
  suffix: string
  rules: ValidationRule[]
}

const props = withDefaults(defineProps<Props>(), {
  suffix: '',
})

const emit = defineEmits(['submit', 'blur'])

const hasError = ref(false)
const model = ref(props.modelValue)
function submit() {
  if (!hasError.value) {
    emit('submit', model.value)
  }
}
</script>
