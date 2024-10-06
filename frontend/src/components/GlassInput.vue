<template>
  <v-container>
    <v-row dense>
      <v-col v-for="item in generalGlassesDataKeys" :key="item" cols="12" class="pa-0 pb-5">
        <auto-complete-field
          ref="firstInput"
          :model-value="modelValue[item]"
          v-bind="glassesMetaUIData[item]"
          :clearable="false"
          :persistent-hint="true"
          @update:model-value="(val) => updateMeta(item, val)"
        />
      </v-col>

      <v-col cols="12" md="6" class="px-1 pr-md-5 py-0">
        <single-eye-input
          eye-name="OD"
          :model-value="modelValue.od"
          :add-enabled="isMultifocal"
          :bal-enabled="balEnabled"
          @update:model-value="(val) => updateOdEye(val)"
        />
      </v-col>
      <v-col cols="12" md="6" class="px-1 pl-md-5 py-0">
        <single-eye-input
          eye-name="OS"
          :model-value="modelValue.os"
          :add-enabled="isMultifocal"
          :bal-enabled="balEnabled"
          @update:model-value="(val) => updateOsEye(val)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import AutoCompleteField from '@/components/AutoCompleteField.vue'
import SingleEyeInput from '@/components/SingleEyeInput.vue'
import { glassesMetaUIData, GlassesMetaUIData } from '@/util/glasses-utils'
import { GlassesInput, DisplayedEye, generalGlassesDataKeys } from '@/model/GlassesModel'
const syncEyes = ref(true)

interface Props {
  onlyCategory?: boolean
  balEnabled?: boolean
}

export interface TestUiDate {
  glassesType: GlassesMetaUIData
  glasesSize?: GlassesMetaUIData
  appearance?: GlassesMetaUIData
}

const actualMeta: Ref<TestUiDate> = ref(glassesMetaUIData)

const { onlyCategory, balEnabled } = withDefaults(defineProps<Props>(), {
  onlyCategory: false,
  balEnabled: false,
})
const modelValue = defineModel<GlassesInput>({ required: true })

const isMultifocal = computed(() => modelValue.value.glassesType === 'multifocal')

if (onlyCategory) {
  actualMeta.value = {
    glassesType: glassesMetaUIData.glassesType,
  }
}

function updateOdEye(newVal: DisplayedEye) {
  const newOs = modelValue.value.os
  if (syncEyes.value) newOs.add = newVal.add
  if (balEnabled && modelValue.value.os.isBAL) {
    newOs.sphere = newVal.sphere
    newOs.cylinder = ''
    newOs.axis = ''
    newOs.add = ''
    newOs.isBAL = false
  }

  // todo eventuell isBal immer setzen wenn balEnabled falls der SingleEyeInput das nicht gemacht
  // hat
  modelValue.value.od = newVal
  modelValue.value.os = newOs
}

function updateMeta(key: string, value: string) {
  modelValue.value[key] = value
}

function updateOsEye(newValue: DisplayedEye) {
  if (newValue.add !== modelValue.value.os.add) syncEyes.value = false
  const newOd = modelValue.value.od
  if (balEnabled && modelValue.value.od.isBAL) {
    newOd.sphere = newValue.sphere
    newOd.cylinder = ''
    newOd.axis = ''
    newOd.add = ''
    newOd.isBAL = false
  }
  modelValue.value.os = newValue
}
</script>
