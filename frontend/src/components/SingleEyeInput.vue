<template>
  <v-row class="pb-4" dense role="group" :aria-labelledby="'eye-heading-' + eyeName">
    <v-col class="text-h5 pb-2">
      <div :id="'eye-heading-' + eyeName" :class="isBAL ? 'text-medium-emphasis' : ''">
        {{ eyeName }}
      </div>
    </v-col>
    <v-col v-for="eyeKey in eyeKeys" :key="eyeKey" cols="12" class="py-0 pl-0">
      <v-text-field
        density="compact"
        type="number"
        :model-value="eyeData[eyeKey].value"
        :label="eyeData[eyeKey].label"
        :rules="!(eyeData[eyeKey].disabled || isBAL) ? eyeRules[eyeKey] : []"
        :step="eyeData[eyeKey].step"
        :disabled="eyeData[eyeKey].disabled || isBAL"
        :prefix="eyeData[eyeKey].value != null ? eyeData[eyeKey].prefix : ''"
        @update:model-value="(val) => emitUpdate(eyeKey, val)"
        @blur="formatAndEmit(eyeKey)"
        @focus="$event.target.select()"
        @keydown.s.prevent
        @keydown.a.prevent
      />
    </v-col>
    <v-col cols="12" class="pa-0">
      <v-checkbox
        v-if="balEnabled"
        v-model="isBAL"
        tabindex="-1"
        class="py-0 my-0"
        :label="`BAL lens (Disable ${eyeName})`"
        hide-details
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { eyeRules, isValidForRules } from '@/util/glasses-utils'
import { DisplayedEye, Eye, EyeKey, EyeSearch, eyeKeys } from '@/model/GlassesModel'

interface Props {
  eyeName: string
  addEnabled?: boolean
  balEnabled?: boolean
}
const { addEnabled = true, balEnabled = false } = defineProps<Props>()
const modelEye = defineModel<DisplayedEye>('modelValue', { required: true })

type EyeData = {
  label: string
  step?: number
  value: string | number
  prefix?: string
  disabled?: boolean
}
type EyeDataMap = {
  [key in EyeKey]: EyeData
}
const eyeData = computed<EyeDataMap>(() => {
  return {
    sphere: {
      label: 'Sphere',
      step: 0.25,
      prefix: Number(modelEye.value.sphere) > 0 ? '+' : '',
      value: modelEye.value.sphere,
    },
    cylinder: {
      label: 'Cylinder (minus form)',
      step: 0.25,
      value: modelEye.value.cylinder,
    },
    axis: {
      label: 'Axis',
      disabled: modelEye.value.cylinder === '' || Number(modelEye.value.cylinder) === 0,
      value: modelEye.value.axis,
    },
    add: {
      label: 'Additional',
      disabled: !addEnabled,
      step: 0.25,
      prefix: '+',
      value: modelEye.value.add || '',
    },
  }
})

const isBAL = computed({
  get() {
    return modelEye.value.isBAL ?? false
  },
  set(val: boolean | undefined) {
    const eye: EyeSearch = { ...modelEye.value, isBAL: val ?? false }
    modelEye.value = eye
  },
})

function emitUpdate(id: keyof Eye, value: string | null) {
  const eye = { ...modelEye.value }
  eye[id] = value ?? ''
  if (modelEye.value[id] === value) return
  modelEye.value = eye
}

watch(
  () => addEnabled,
  (enabled) => {
    if (!enabled) {
      emitUpdate('add', '')
    }
  },
)

function formatAndEmit(id: keyof Eye) {
  let newVal = Number(eyeData.value[id].value)
  if (id === 'cylinder') {
    // replace empty cylinder with 0
    if (isNaN(newVal)) newVal = 0

    // always use negative cylinder
    newVal = -Math.abs(Number(newVal))

    if (newVal === 0) {
      // reset axis if cylinder is 0 and force update
      modelEye.value = {
        ...modelEye.value,
        cylinder: '0.00',
        axis: '',
      }
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
