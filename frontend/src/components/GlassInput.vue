<template>
  <v-container>
    <v-row dense>
      <v-col v-for="item in generalGlassesDataKeys" :key="item" cols="12" class="pa-0 pb-5">
        <auto-complete-field
          ref="firstInput"
          :model-value="modelValue[item]"
          v-bind="glassesMetaUIData[item]"
          :clearable="false"
          @update:model-value="(val) => updateMeta(item, val)"
        />
      </v-col>

      <v-col cols="12" md="6" class="px-1 pr-md-5 py-0">
        <single-eye-input
          eye-name="OD"
          :model-value="modelValue.od"
          :add-enabled="isMultifocal"
          @update:model-value="(val) => updateOdEye(val)"
        />
      </v-col>
      <v-col cols="12" md="6" class="px-1 pl-md-5 py-0">
        <single-eye-input
          eye-name="OS"
          :model-value="modelValue.os"
          :add-enabled="isMultifocal"
          @update:model-value="(val) => updateOsEye(val)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import AutoCompleteField from '@/components/AutoCompleteField.vue'
import SingleEyeInput from '@/components/SingleEyeInput.vue'
import { glassesMetaUIData } from '@/util/glasses-utils'
import { GlassesInput, DisplayedEye, generalGlassesDataKeys } from '@/model/GlassesModel'
const syncEyes = ref(true)

interface Props {
  onlyCategory?: boolean
}

const { onlyCategory } = withDefaults(defineProps<Props>(), { onlyCategory: false })
const modelValue = defineModel<GlassesInput>({ required: true })

const isMultifocal = computed(() => modelValue.value.glassesType === 'multifocal')

function updateOdEye(newVal: DisplayedEye) {
  const newOs = modelValue.value.os
  if (syncEyes.value) newOs.add = newVal.add

  modelValue.value.od = newVal
  modelValue.value.os = newOs
}

function updateMeta(key: string, value: string) {
  modelValue.value[key] = value
}

function updateOsEye(newValue: DisplayedEye) {
  if (newValue.add !== modelValue.value.os.add) syncEyes.value = false
  modelValue.value.os = newValue
}
</script>
