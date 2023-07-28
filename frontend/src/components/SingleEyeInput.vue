<template>
  <div>
    <v-row dense>
      <v-col class="text-h5 pb-2">
        <div :class="isBAL ? 'text-medium-emphasis' : ''">
          {{ eyeName }}
        </div>
      </v-col>
      <v-col v-for="eyeKey in eyeKeys" :key="eyeKey" cols="12" class="py-0 pl-0">
        <v-text-field
          density="compact"
          type="number"
          :value="eyeData[eyeKey].value"
          :label="eyeData[eyeKey].label"
          :rules="!(eyeData[eyeKey].disabled || isBAL) ? eyeRules[eyeKey] : []"
          :step="eyeData[eyeKey].step"
          :disabled="eyeData[eyeKey].disabled || isBAL"
          :prefix="eyeData[eyeKey].value != null ? eyeData[eyeKey].prefix : ''"
          @update:model-value="(val) => input(eyeKey, val)"
          @update:error="(val: boolean) => (hasError[eyeKey] = val)"
          @blur="update(eyeKey)"
          @focus="$event.target.select()"
          @keydown.s.prevent
          @keydown.a.prevent
        />
      </v-col>
      <v-col cols="12" class="pa-0 pb-4">
        <v-checkbox
          v-if="balEnabled"
          :model-value="isBAL"
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
import { eyeRules } from '@/lib/util'
import { Eye, EyeKey, OptionalEye, eyeKeys } from '@/model/GlassesModel'
import { ref, computed } from 'vue'

interface Props extends OptionalEye {
  eyeName: string
  addEnabled: boolean
  isBAL?: boolean
  balEnabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  axis: '',
  sphere: '',
  add: '',
  cylinder: '',
  addEnabled: true,
  isBAL: false,
  balEnabled: false,
})
type UpdateType = { id: keyof Eye; value: number | string }
const emit = defineEmits<{
  'update:modelValue': [UpdateType]
  'update:isBal': [boolean]
}>()

const hasError = ref({
  // workaround, see https://stackoverflow.com/a/59439106/4026792
  sphere: true,
  cylinder: false, // allow (initial) empty fields
  axis: true,
  add: true,
})
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
      // prefix: this.sphere > 0 ? '+' : '',
      value: props.sphere,
    },
    cylinder: {
      label: 'Cylinder (minus form)',
      step: 0.25,
      value: props.cylinder,
    },
    axis: {
      label: 'Axis',
      disabled: props.cylinder === '' || props.cylinder === 0,
      value: props.axis,
    },
    add: {
      label: 'Additional',
      disabled: !props.addEnabled,
      step: 0.25,
      prefix: '+',
      value: props.add,
    },
  }
})

function input(id: keyof Eye, value: number | string) {
  emit('update:modelValue', { id, value })
}

function update(id: keyof Eye) {
  let newVal = eyeData.value[id].value
  if (id === 'cylinder') {
    // replace empty cylinder with 0
    if (newVal === undefined || newVal == null || newVal === '') newVal = 0

    // always use negative cylinder internally
    newVal = -Math.abs(Number(newVal))

    if (newVal === 0) {
      // emit cylinder value here already to force update
      input(id, 0)
      // reset axis if cylinder is 0 and force update
      input('axis', '000')
      return
    }
  }
  if (!hasError.value[id]) {
    const step = eyeData.value[id].step
    if (step !== undefined && step > 0) {
      const number = Math.ceil(Math.abs(Number(newVal)) / step) * step
      if (!isNaN(number)) {
        // re-add the sign
        // nicer number formatting with leading decimals, doesn't really work now because we use "number" type input fields
        const numberString = (Number(newVal) < 0 ? '-' : '') + number.toFixed(2)
        input(id, Number(numberString))
      }
    }
  }
}
</script>
