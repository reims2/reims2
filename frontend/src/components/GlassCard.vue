<template>
  <v-card style="min-width: 290px" class="mb-2" :loading="loading">
    <v-card-title v-if="displayedGlass.sku" class="pb-0 pt-4">
      <div class="d-flex align-center">
        <v-chip
          v-if="isGlassesResult(props.modelValue)"
          class="mr-2 px-2"
          size="small"
          color="white"
          label
          :ripple="false"
          :style="{ 'background-color': calcColorGradient(props.modelValue.score) }"
        >
          <v-tooltip activator="parent" location="bottom">
            Result (Philscore) - lower values are better
          </v-tooltip>
          {{ props.modelValue.score.toFixed(2) }}
        </v-chip>
        <div class="text-h6">SKU {{ displayedGlass.sku }}</div>
      </div>
    </v-card-title>
    <v-card-subtitle class="pb-2 d-flex align-center">
      <span v-for="key in generalGlassesDataKeys" :key="key" class="pr-2">
        <span class="no-child-padding" @click="edit = key">
          <v-tooltip location="bottom" activator="parent" :disabled="editable && edit == key">
            {{ generalEyeData[key].desc }}
          </v-tooltip>
          <v-select
            v-if="editable && edit == key"
            :model-value="displayedGlass[key]"
            :items="generalEyeData[key].items"
            auto-select-first
            density="compact"
            single-line
            hide-details
            style="max-width: 160px; min-width: 90px"
            autofocus
            @update:model-value="(value) => editMeta(key, value)"
            @blur="edit = ''"
          />
          <span v-else>
            <v-icon size="small">
              {{ generalEyeData[key].icon }}
            </v-icon>
            {{ displayedGlass[key] }}
          </span>
        </span>
      </span>
    </v-card-subtitle>
    <v-card-text class="py-0">
      <v-container class="pa-0">
        <v-row dense>
          <v-col v-for="eye in eyes" :key="eye.key" cols="6">
            <div class="d-flex">
              <div class="text-subtitle-1">
                {{ eye.text }}
              </div>
              <div v-if="isGlassesResult(props.modelValue)" class="d-flex align-center">
                <v-chip class="ml-2 px-2" size="x-small" label :ripple="false">
                  <v-tooltip activator="parent" location="bottom">
                    PhilScore only for {{ eye.text }}
                  </v-tooltip>
                  {{
                    (eye.key == 'od' ? props.modelValue.odScore : props.modelValue.osScore).toFixed(
                      2,
                    )
                  }}
                </v-chip>
              </div>
            </div>
            <tr v-for="dataKey in eyeDataKeys" :key="dataKey" @click="edit = eye.key + dataKey">
              <td class="text-medium-emphasis pr-2">
                {{ eyeUIData[dataKey].label }}
              </td>
              <td>
                <glass-card-input-span
                  :model-value="displayedGlass[eye.key][dataKey]"
                  :suffix="eyeUIData[dataKey].suffix"
                  :rules="eyeRules[dataKey]"
                  :is-editing="editable && edit == eye.key + dataKey"
                  @update:model-value="(value) => editEye(eye.key, dataKey, value)"
                  @blur="edit = ''"
                />
              </td>
            </tr>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions class="pt-0 mx-0" style="padding-left: 6px">
      <v-tooltip location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-btn v-if="editable && edit == ''" v-bind="tooltipProps" variant="text" class="mx-0">
            Edit
          </v-btn>
        </template>
        Do you want to edit glasses? Simply
        <span class="font-weight-bold">click</span>
        on the value
      </v-tooltip>

      <v-btn v-if="editable && edit != ''" variant="text" class="mx-0" @click="edit = ''">
        Cancel Edit
      </v-btn>
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { deepCopyGlasses, eyeRules, generalEyeData, sanitizeEyeValues } from '@/lib/util'
import GlassCardInputSpan from './GlassCardInputSpan.vue'
import { useGlassesStore } from '@/stores/glasses'
import {
  Eye,
  DisplayedEye,
  DisplayedGlasses,
  EyeKey,
  GeneralGlassesDataKey,
  Glasses,
  GlassesAppearance,
  GlassesEyeIndex,
  GlassesResult,
  GlassesSize,
  GlassesType,
  eyeKeys,
  generalGlassesDataKeys,
} from '@/model/GlassesModel'
import { useToast } from 'vue-toastification'
import { ReimsAxiosError } from '@/lib/axios'
import { calcColorGradient } from '@/lib/color'

const toast = useToast()

const glassesStore = useGlassesStore()

const props = withDefaults(
  defineProps<{ modelValue: Glasses | GlassesResult; editable?: boolean }>(),
  {
    editable: false,
  },
)

const emit = defineEmits(['update:modelValue'])

const eyes: { text: string; key: GlassesEyeIndex }[] = [
  { text: 'OD', key: 'od' },
  { text: 'OS', key: 'os' },
]

const edit = ref('')
const loading = ref(false)
const eyeDataKeys = computed(() => {
  if (props.modelValue.glassesType === 'multifocal') return eyeKeys
  else return eyeKeys.filter((k) => k !== 'add')
})

type EyeData = {
  label: string
  suffix: string
  step?: number
}
type EyeDataMap = {
  // eslint-disable-next-line no-unused-vars
  [key in EyeKey]: EyeData
}
const eyeUIData: EyeDataMap = {
  sphere: {
    label: 'SPH',
    suffix: 'D',
    step: 0.25,
  },
  cylinder: {
    label: 'CYL',
    suffix: 'D',
  },
  axis: {
    label: 'Axis',
    suffix: '',
  },
  add: {
    label: 'Add',
    suffix: 'D',
  },
}

const displayedGlass = computed(() => {
  const displayedGlasses: DisplayedGlasses = {
    od: formatEyeValues(props.modelValue.od),
    os: formatEyeValues(props.modelValue.os),
    glassesSize: props.modelValue.glassesSize,
    glassesType: props.modelValue.glassesType,
    appearance: props.modelValue.appearance,
    sku: getAndConvertSku(),
  }
  return displayedGlasses
})

function getAndConvertSku() {
  if (props.modelValue.sku != null) return props.modelValue.sku.toString().padStart(4, '0')
  else if (props.modelValue.dispense?.previousSku != null) {
    return props.modelValue.dispense.previousSku.toString().padStart(4, '0')
  } else return undefined
}

function formatEyeValues(eye: Eye): DisplayedEye {
  return {
    sphere: formatNumber(eye.sphere, 2),
    cylinder: formatNumber(eye.cylinder, 2),
    axis: eye.axis.toString().padStart(3, '0'),
    add: formatNumber(eye.add, 2),
  }
}

function formatNumber(val: number | undefined, decimals: number) {
  if (val === undefined) return ''
  const prefix = val === 0 ? '' : val < 0 ? '-' : '+'
  return prefix + Math.abs(Number(val)).toFixed(decimals)
}
async function editMeta(dataKey: GeneralGlassesDataKey, value: string) {
  if (!props.editable) return // just as a "safety" fallback
  const newGlasses: Glasses = deepCopyGlasses(props.modelValue)
  if (dataKey === 'glassesType') {
    newGlasses[dataKey] = value as GlassesType
  } else if (dataKey === 'appearance') {
    newGlasses[dataKey] = value as GlassesAppearance
  } else if (dataKey === 'glassesSize') {
    newGlasses[dataKey] = value as GlassesSize
  }
  await startEdit(newGlasses)
}
async function editEye(eyeKey: GlassesEyeIndex, dataKey: EyeKey, value: string | number) {
  const newGlasses: Glasses = deepCopyGlasses(props.modelValue)
  newGlasses[eyeKey][dataKey] = Number(value)
  newGlasses[eyeKey] = sanitizeEyeValues(newGlasses[eyeKey])
  await startEdit(newGlasses)
}
async function startEdit(newGlasses: Glasses) {
  if (!props.editable) return // just as a "safety" fallback
  try {
    loading.value = true
    await glassesStore.editGlasses(newGlasses)
  } catch (error) {
    if (error instanceof ReimsAxiosError && (error.isServerSide || error.isNetwork)) {
      toast.error(`Glasses will be automatically edited as soon as the connection is back.`)
      // no return here, we act like it's successful
    } else {
      toast.error(`Glasses can't be edited (${error.message}). Please retry later`)
      return
    }
  } finally {
    loading.value = false
  }
  emit('update:modelValue', newGlasses)
  edit.value = ''
}
function isGlassesResult(value: GlassesResult | Glasses): value is GlassesResult {
  return (value as GlassesResult).score !== undefined
}
</script>

<style scoped>
.no-child-padding .v-text-field {
  padding: 0px;
  margin: 0px;
}

.v-btn {
  min-width: 0px !important;
}
</style>
