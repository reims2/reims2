<template>
  <v-container class="pa-0">
    <v-row no-gutters>
      <v-col
        v-for="item in metadataToShow"
        :key="item"
        :cols="12"
        :md="item === 'glassesType' ? 12 : 6"
        class="pa-0 pb-5"
        :class="{ 'pr-md-3': item === 'appearance', 'pl-md-3': item === 'glassesSize' }"
      >
        <auto-complete-field
          ref="firstInput"
          :model-value="modelValue[item]"
          v-bind="glassesMetaUIData[item]"
          :clearable="false"
          :persistent-hint="!glassesTypeOnly"
          @update:model-value="(val) => updateMeta(item, val)"
        />
      </v-col>
      <v-col v-if="!glassesTypeOnly" cols="12" class="pa-0 pb-6">
        <v-divider />
      </v-col>

      <v-col cols="12" md="6" class="px-0 pr-md-3 py-0">
        <single-eye-input
          eye-name="OD"
          :model-value="modelValue.od"
          :add-enabled="isMultifocal"
          @update:model-value="(val) => updateEye('od', val)"
        />
      </v-col>
      <v-col cols="12" md="6" class="px-0 pl-md-3 py-0">
        <single-eye-input
          eye-name="OS"
          :model-value="modelValue.os"
          :add-enabled="isMultifocal"
          @update:model-value="(val) => updateEye('os', val)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import AutoCompleteField from '@/components/AutoCompleteField.vue'
import SingleEyeInput from '@/components/SingleEyeInput.vue'
import { glassesMetaUIData } from '@/util/glasses-utils'
import {
  GlassesInput,
  DisplayedEye,
  GeneralGlassesDataKey,
  GlassesEyeIndex,
  EyeSearch,
  generalGlassesDataKeys,
  isEyeSearch,
} from '@/model/GlassesModel'

const { glassesTypeOnly = false } = defineProps<{ glassesTypeOnly?: boolean }>()
const modelValue = defineModel<GlassesInput>({ required: true })
const syncEyes = defineModel<boolean>('syncEyes', { default: false })

const firstInput = ref<HTMLElement[] | null>(null)
const metadataToShow = computed<readonly GeneralGlassesDataKey[]>(() =>
  glassesTypeOnly ? ['glassesType'] : generalGlassesDataKeys,
)

const isMultifocal = computed(() => modelValue.value.glassesType !== 'single')

function updateMeta(key: GeneralGlassesDataKey, value: string) {
  Object.assign(modelValue.value, { [key]: value })
}

function resetBalEye(nonBalEye: EyeSearch, balEye: EyeSearch) {
  balEye.sphere = nonBalEye.sphere
  balEye.cylinder = ''
  balEye.axis = ''
  balEye.add = ''
  balEye.isBAL = true
  nonBalEye.isBAL = false
}

function updateEye(key: GlassesEyeIndex, eye: DisplayedEye | EyeSearch) {
  const other = modelValue.value[key === 'od' ? 'os' : 'od']
  // OS follows OD's add until OS's add is changed itself
  if (key === 'od' && syncEyes.value) other.add = eye.add
  if (key === 'os' && eye.add !== modelValue.value.os.add) syncEyes.value = false
  if (isEyeSearch(eye) && isEyeSearch(other)) {
    if (eye.isBAL) resetBalEye(other, eye)
    else if (other.isBAL) resetBalEye(eye, other)
  }
  modelValue.value[key] = eye
}

function focus() {
  firstInput.value?.[0]?.focus()
}
defineExpose({ focus })
</script>
