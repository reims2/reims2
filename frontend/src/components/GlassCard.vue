<template>
  <v-card style="min-width: 280px" class="mb-2" :loading="loading">
    <v-tooltip v-model="showTooltip" location="bottom" activator="parent">
      Do you want to edit glasses? Simply
      <span class="font-weight-bold">click</span>
      on any value
    </v-tooltip>
    <v-card-title v-if="glass.sku">
      <div v-if="isGlassesResult(glass)" class="d-flex align-center">
        <v-tooltip location="bottom">
          <template #activator="{ props }">
            <v-chip
              class="mr-2 px-2 white--text font-weight-black"
              :color="calcColor(glass.score)"
              small
              label
              :ripple="false"
              v-bind="props"
            >
              {{ glass.score.toFixed(2) }}
            </v-chip>
          </template>
          Result (Philscore) - lower values are better
        </v-tooltip>
      </div>
      <span class="mr-1">SKU</span>
      {{ glass.sku.toString().padStart(4, '0') }}
    </v-card-title>
    <v-card-subtitle class="text--primary pb-2 d-flex align-center">
      <span v-for="key in generalGlassesDataKeys" :key="key" class="pr-2">
        <v-tooltip location="bottom" :disabled="editable && edit == key">
          <template #activator="{ props }">
            <span class="no-child-padding" @click="edit = key">
              <v-select
                v-if="editable && edit == key"
                :value="glass[key]"
                :items="generalEyeData[key].items"
                auto-select-first
                single-line
                hide-details
                style="max-width: 130px"
                autofocus
                @update:modelValue="(value) => editMeta(key, value)"
                @blur="edit = ''"
              />
              <span v-else v-bind="props">
                <v-icon small color="black">
                  {{ generalEyeData[key].icon }}
                </v-icon>
                {{ glass[key] }}
              </span>
            </span>
          </template>
          {{ generalEyeData[key].desc }}
        </v-tooltip>
      </span>
    </v-card-subtitle>
    <v-card-text class="py-0">
      <v-container class="text--primary pa-0">
        <v-row dense>
          <v-col v-for="eye in eyes" :key="eye.key" cols="6">
            <div class="d-flex">
              <div class="text-subtitle-1">
                {{ eye.text }}
              </div>
              <div v-if="isGlassesResult(glass)" class="d-flex align-center">
                <v-tooltip location="bottom">
                  <template #activator="{ props }">
                    <v-chip class="ml-2 px-2" x-small label :ripple="false" v-bind="props">
                      {{ (eye.key == 'od' ? glass.odScore! : glass.osScore!).toFixed(2) }}
                    </v-chip>
                  </template>
                  PhilScore only for {{ eye.text }}
                </v-tooltip>
              </div>
            </div>
            <tr v-for="dataKey in eyeDataKeys" :key="dataKey" @click="edit = eye.key + dataKey">
              <td class="text--secondary pr-2">
                {{ eyeUIData[dataKey].label }}
              </td>
              <td>
                <editable-span
                  :modelValue="
                    eyeUIData[dataKey].format(glass[eye.key as GlassesEyeIndex][dataKey])
                  "
                  :suffix="eyeUIData[dataKey].suffix"
                  :rules="eyeRules[dataKey]"
                  :is-editing="editable && edit == eye.key + dataKey"
                  @submit="(value) => editEye(eye.key as GlassesEyeIndex, dataKey, value)"
                />
              </td>
            </tr>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions class="pt-0 mx-0" style="padding-left: 6px">
      <v-btn
        v-if="editable && edit == ''"
        variant="text"
        class="mx-0"
        @click="showTooltip = !showTooltip"
      >
        Edit
      </v-btn>
      <v-btn v-if="editable && edit != ''" variant="text" class="mx-0" @click="edit = ''">
        Cancel Edit
      </v-btn>
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import chroma from 'chroma-js'
import { deepCopyGlasses, eyeRules, generalEyeData, sanitizeEyeValues } from '@/lib/util'
import EditableSpan from './EditableSpan.vue'
import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'
import { computed, ref, watch } from 'vue'
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

const glassesStore = useGlassesStore()
const rootStore = useRootStore()

const props = withDefaults(defineProps<{ glass: Glasses | GlassesResult; editable: boolean }>(), {
  editable: false,
})

const emit = defineEmits(['edited'])

const eyes = ref([
  {
    text: 'OD',
    key: 'od',
  },
  {
    text: 'OS',
    key: 'os',
  },
])

const edit = ref('')
const showTooltip = ref(false)
const loading = ref(false)
const eyeDataKeys = computed(() => {
  if (props.glass.glassesType === 'multifocal') return eyeKeys
  else return eyeKeys.filter((k) => k !== 'add')
})
type EyeData = {
  label: string
  format: (v: any) => string
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
    format: (v: any) => formatNumber(v as number, 2),
    suffix: 'D',
    step: 0.25,
  },
  cylinder: {
    label: 'CYL',
    format: (v: any) => formatNumber(v as number, 2),
    suffix: 'D',
  },
  axis: {
    label: 'Axis',
    format: (v: any) =>
      parseInt(v as string)
        .toString()
        .padStart(3, '0'),
    suffix: '',
  },
  add: {
    label: 'Add',
    format: (v: any) => formatNumber(v as number, 2),
    suffix: 'D',
  },
}

watch(edit, () => {
  showTooltip.value = false
})

function calcColor(val: number) {
  const scale = chroma.scale(['#F57F17', '#009688']).domain([2, 0])
  return scale(val).hex()
}
function formatNumber(val: number, decimals: number) {
  const prefix = val === 0 ? '' : val < 0 ? '-' : '+'
  return prefix + Math.abs(Number(val)).toFixed(decimals)
}
async function editMeta(dataKey: GeneralGlassesDataKey, value: any) {
  if (!props.editable) return // just as a "safety" fallback
  const newGlasses: Glasses = deepCopyGlasses(props.glass)
  if (dataKey === 'glassesType') {
    newGlasses[dataKey] = value as GlassesType
  } else if (dataKey === 'appearance') {
    newGlasses[dataKey] = value as GlassesAppearance
  } else if (dataKey === 'glassesSize') {
    newGlasses[dataKey] = value as GlassesSize
  }
  await startEdit(newGlasses)
}
async function editEye(eyeKey: GlassesEyeIndex, dataKey: EyeKey, value: any) {
  if (!props.editable) return // just as a "safety" fallback
  const newGlasses: Glasses = deepCopyGlasses(props.glass)
  newGlasses[eyeKey][dataKey] = Number(value)
  newGlasses[eyeKey] = sanitizeEyeValues(newGlasses[eyeKey])
  await startEdit(newGlasses)
}
async function startEdit(newGlasses: Glasses) {
  try {
    loading.value = true
    await glassesStore.editGlasses(newGlasses)
  } catch (error) {
    if (error.response && error.response.status < 500) {
      // TODO catch network errors because they'll be retried.
      edit.value = ''
      rootStore.setError(`Glasses can't be edited, sorry (Error ${error.status})`)
    } else {
      rootStore.setError(
        `Editing was not possible because the server didn't respond. Please retry (Error ${error.status}).`,
      )
    }
    loading.value = false
    return
  }
  loading.value = false
  edit.value = ''
  emit('edited', newGlasses)
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
