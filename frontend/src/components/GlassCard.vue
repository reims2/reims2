<template>
  <v-card style="min-width: 290px" class="mb-2" :loading="loading">
    <div class="d-flex align-center pt-4">
      <div class="flex-grow-1 pt-2">
        <v-card-title class="py-0">
          <div class="text-h6">SKU {{ displayedGlass.sku }}</div>
        </v-card-title>
        <v-card-subtitle class="pb-2 d-flex align-center">
          <span v-for="key in generalGlassesDataKeys" :key="key" class="pr-2">
            <span class="no-child-padding" @click="edit = key">
              <v-tooltip location="bottom" activator="parent" :disabled="editable && edit == key">
                {{ glassesMetaUIData[key].desc }}
              </v-tooltip>
              <v-select
                v-if="editable && edit == key"
                :model-value="displayedGlass[key]"
                :items="glassesMetaUIData[key].items"
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
                  {{ glassesMetaUIData[key].icon }}
                </v-icon>
                {{ displayedGlass[key] }}
              </span>
            </span>
          </span>
        </v-card-subtitle>
      </div>
      <div v-if="isGlassesResult(props.modelValue)">
        <v-progress-circular
          class="mr-7"
          :model-value="convertScoreToPercentage(props.modelValue.score)"
          :size="53"
          :width="7"
          :color="calcColorGradient(props.modelValue.score)"
          :style="{ fontSize: '13px' }"
        >
          <template #default>{{ convertScoreToPercentage(props.modelValue.score) }} %</template>
        </v-progress-circular>
        <v-tooltip activator="parent" location="bottom">
          Estimated match in percent (PhilScore of {{ props.modelValue.score.toFixed(2) }})
        </v-tooltip>
      </div>
    </div>
    <v-card-text class="py-0">
      <v-container class="pa-0">
        <v-row dense>
          <v-col v-for="eye in eyes" :key="eye.key" cols="6" :data-testid="eye.text + '-card'">
            <div class="d-flex">
              <div class="text-subtitle-1">
                {{ eye.text }}
              </div>
              <v-tooltip activator="parent" location="bottom">
                Match percentage only for {{ eye.text }}
              </v-tooltip>

              <div v-if="isGlassesResult(props.modelValue)" class="d-flex align-center">
                <v-chip class="ml-2 px-2" size="x-small" label :ripple="false">
                  {{
                    convertScoreToPercentage(
                      eye.key == 'od' ? props.modelValue.odScore : props.modelValue.osScore,
                      true,
                    )
                  }}
                  %
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
import { deepCopyGlasses, eyeRules, glassesMetaUIData } from '@/util/glasses-utils'
import { sanitizeEyeValues } from '@/util/eye-utils'
import GlassCardInputSpan from '@/components/GlassCardInputSpan.vue'
import { useGlassesStore } from '@/stores/glasses'
import {
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
import { formatGlassesForDisplay } from '@/util/format-glasses'

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

const displayedGlass = computed(() => formatGlassesForDisplay(props.modelValue))

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

function convertScoreToPercentage(score: number, singleEye = false): string {
  if (singleEye) score = score * 2
  const clampedScore = Math.max(Math.min(score, 4), 0)
  let percentage: number
  if (clampedScore <= 2) percentage = 100 - clampedScore * 35
  else percentage = 30 - (clampedScore - 2) * 15
  return percentage.toFixed(0)
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

.dot {
  height: 40px;
  width: 40px;
  line-height: 40px;
  border-radius: 50%;
  font-size: 14px;
  color: white;
  text-align: center;
}
</style>
