<template>
  <div>
    <v-row dense>
      <v-col class="text-h5 pb-2">
        <div :class="isBal ? 'text-medium-emphasis' : ''">
          {{ eyeName }}
        </div>
      </v-col>
      <v-col v-for="eyeKey in eyeKeys" :key="eyeKey" cols="12" class="py-0 pl-0">
        <v-text-field
          density="compact"
          type="number"
          :model-value="eyeData[eyeKey].value"
          :label="eyeData[eyeKey].label"
          :rules="!(eyeData[eyeKey].disabled || isBal) ? eyeRules[eyeKey] : []"
          :step="eyeData[eyeKey].step"
          :disabled="eyeData[eyeKey].disabled || isBal"
          :prefix="eyeData[eyeKey].value != null ? eyeData[eyeKey].prefix : ''"
          @update:model-value="(val) => emitUpdate(eyeKey, val)"
          @blur="formatAndEmit(eyeKey)"
          @focus="$event.target.select()"
          @keydown.s.prevent
          @keydown.a.prevent
        />
      </v-col>
      <v-col cols="12" class="pa-0 pb-4">
        <v-checkbox
          v-if="balEnabled"
          v-model="isBal"
          tabindex="-1"
          class="py-0 my-0"
          :label="`BAL lens (Disable ${eyeName})`"
          hide-details
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { eyeRules, isValidForRules } from '@/util/glasses-utils'
import { DisplayedEye, Eye, EyeKey, eyeKeys } from '@/model/GlassesModel'

interface Props {
  modelValue: DisplayedEye & { isBAL?: boolean | null }
  eyeName: string
  addEnabled: boolean
  balEnabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  addEnabled: true,
  balEnabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [DisplayedEye]
}>()

type EyeData = {
  label: string
  step?: number
  value: string | number
  prefix?: string
  disabled?: boolean
}
type EyeDataMap = {
  // eslint-disable-next-line no-unused-vars
  [key in EyeKey]: EyeData
}
const eyeData = computed<EyeDataMap>(() => {
  return {
    sphere: {
      label: 'Sphere',
      step: 0.25,
      prefix: Number(props.modelValue.sphere) > 0 ? '+' : '',
      value: props.modelValue.sphere,
    },
    cylinder: {
      label: 'Cylinder (minus form)',
      step: 0.25,
      value: props.modelValue.cylinder,
    },
    axis: {
      label: 'Axis',
      disabled: props.modelValue.cylinder === '' || Number(props.modelValue.cylinder) === 0,
      value: props.modelValue.axis,
    },
    add: {
      label: 'Additional',
      disabled: !props.addEnabled,
      step: 0.25,
      prefix: '+',
      value: props.modelValue.add || '',
    },
  }
})

const isBal = computed({
  get() {
    return props.modelValue.isBAL || false
  },
  set(val: boolean | undefined) {
    const eye = { ...props.modelValue }
    eye.isBAL = val
    emit('update:modelValue', eye)
  },
})

function emitUpdate(id: keyof Eye, value: string | null) {
  const eye = { ...props.modelValue }
  eye[id] = value ?? ''
  emit('update:modelValue', eye)
}

function formatAndEmit(id: keyof Eye) {
  let newVal = Number(eyeData.value[id].value)
  if (id === 'cylinder') {
    // replace empty cylinder with 0
    if (isNaN(newVal)) newVal = 0

    // always use negative cylinder
    newVal = -Math.abs(Number(newVal))

    if (newVal === 0) {
      // reset axis if cylinder is 0 and force update
      emit('update:modelValue', {
        ...props.modelValue,
        cylinder: '0.00',
        axis: '',
      })
      return
    }
  }

  if (!isValidForRules(eyeData.value[id].value, eyeRules[id])) return
  const step = eyeData.value[id].step
  if (step !== undefined && step > 0) {
    const numberAbs = Math.ceil(Math.abs(Number(newVal)) / step) * step
    if (!isNaN(numberAbs)) {
      // readd the sign and format (no prefix +, doesn't work in firefox)
      const numberString = (Number(newVal) < 0 ? '-' : '') + numberAbs.toFixed(2)
      emitUpdate(id, numberString)
    }
  }
}
</script>
