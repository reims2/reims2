<template>
  <v-container class="pa-1">
    <v-row dense>
      <v-col v-for="item in metadataToShow" :key="item" cols="12" class="pa-0 pb-4">
        <auto-complete-field
          ref="firstInput"
          :model-value="modelValue[item]"
          v-bind="glassesMetaUIData[item]"
          :clearable="false"
          :persistent-hint="true"
          @update:model-value="(val) => updateMeta(item, val)"
        />
      </v-col>

      <v-col cols="12" md="6" class="px-0 pl-md-1 pr-md-5 py-md-0 py-1">
        <single-eye-input
          eye-name="OD"
          :model-value="modelValue.od"
          :add-enabled="isMultifocal"
          :bal-enabled="balEnabled"
          @update:model-value="(val) => updateOdEye(val)"
        />
      </v-col>
      <v-col cols="12" md="6" class="px-0 pl-md-5 py-0">
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
import { glassesMetaUIData } from '@/util/glasses-utils'
import { GlassesInput, DisplayedEye, GeneralGlassesDataKey } from '@/model/GlassesModel'

const {
  glassesTypeOnly = false,
  balEnabled = false,
  syncAdd = true,
} = defineProps<{
  glassesTypeOnly?: boolean
  balEnabled?: boolean
  syncAdd?: boolean
}>()
const modelValue = defineModel<GlassesInput>({ required: true })

// FIXME sync eye is not resetted to true
const syncEyes = ref(syncAdd)
const firstInput = ref<HTMLElement[] | null>(null)
const metadataToShow: Ref<GeneralGlassesDataKey[]> = ref([])

const isMultifocal = computed(() => modelValue.value.glassesType === 'multifocal')

watchEffect(() => {
  metadataToShow.value = glassesTypeOnly
    ? ['glassesType']
    : ['glassesType', 'appearance', 'glassesSize']
})

function updateMeta(key: string, value: string) {
  modelValue.value[key] = value
}

function resetBalEye(nonBalEye: DisplayedEye, balEye: DisplayedEye) {
  balEye.sphere = nonBalEye.sphere
  balEye.cylinder = ''
  balEye.axis = ''
  balEye.add = ''
  balEye.isBAL = true
  nonBalEye.isBAL = false
}

function updateOdEye(newOd: DisplayedEye) {
  const newOs = modelValue.value.os
  if (syncEyes.value) newOs.add = newOd.add
  if (balEnabled && newOd.isBAL) {
    resetBalEye(newOs, newOd)
  }
  if (balEnabled && newOs.isBAL) {
    resetBalEye(newOd, newOs)
  }

  modelValue.value.od = newOd
  modelValue.value.os = newOs
}

function updateOsEye(newOs: DisplayedEye) {
  if (newOs.add !== modelValue.value.os.add) syncEyes.value = false
  const newOd = modelValue.value.od
  if (balEnabled && newOs.isBAL) {
    resetBalEye(newOd, newOs)
  }
  if (balEnabled && newOd.isBAL) {
    resetBalEye(newOs, newOd)
  }
  modelValue.value.os = newOs
  modelValue.value.od = newOd
}

function focus() {
  if (firstInput.value && firstInput.value.length) {
    firstInput.value[0]?.focus()
  }
}
defineExpose({ focus })
</script>
