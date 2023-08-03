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
          @update:model-value="(val) => input(eyeKey, val)"
          @blur="update(eyeKey)"
          @focus="$event.target.select()"
          @keydown.s.prevent
          @keydown.a.prevent
        />
      </v-col>
      <v-col cols="12" class="pa-0 pb-4">
        <v-checkbox
          v-if="balEnabled"
          :model-value="isBal"
          tabindex="-1"
          class="py-0 my-0"
          :label="`BAL lens (Disable ${eyeName})`"
          hide-details
          @update:model-value="(val: boolean) => emit('update:isBal', val)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { eyeRules, isValidForRules } from '@/lib/util'
import { DisplayedEye, Eye, EyeKey, eyeKeys } from '@/model/GlassesModel'

interface Props {
  modelValue: DisplayedEye
  eyeName: string
  addEnabled: boolean
  isBal?: boolean
  balEnabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  addEnabled: true,
  isBal: false,
  balEnabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [DisplayedEye]
  'update:isBal': [boolean]
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

function input(id: keyof Eye, value: string | null) {
  const eye = { ...props.modelValue }
  eye[id] = value ?? ''
  emit('update:modelValue', eye)
}

function update(id: keyof Eye) {
  let newVal = eyeData.value[id].value
  if (id === 'cylinder') {
    // replace empty cylinder with 0
    if (newVal === undefined || newVal == null || newVal === '') newVal = 0

    // always use negative cylinder internally
    newVal = -Math.abs(Number(newVal))

    if (newVal === 0) {
      // emit cylinder value here already to force update FIXME
      input(id, '0')
      // reset axis if cylinder is 0 and force update
      input('axis', '')
      return
    }
  }

  if (!isValidForRules(eyeData.value[id].value, eyeRules[id])) return
  const step = eyeData.value[id].step
  if (step !== undefined && step > 0) {
    const number = Math.ceil(Math.abs(Number(newVal)) / step) * step
    if (!isNaN(number)) {
      // re-add the sign
      // nicer number formatting with leading decimals, doesn't really work now because we use "number" type input fields
      const numberString = (Number(newVal) < 0 ? '-' : '') + number.toFixed(2)
      input(id, numberString)
    }
  }
}
</script>
