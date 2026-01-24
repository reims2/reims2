<template>
  <v-card
    style="min-width: 330px"
    class="mb-2"
    :loading="loading"
    aria-role="group"
    :aria-labelledby="'heading-glass-' + displayedGlass.sku"
  >
    <div class="d-flex align-center pt-4">
      <div class="flex-grow-1 pt-2">
        <v-card-title class="py-0">
          <div :id="'heading-glass-' + displayedGlass.sku" class="text-h6">
            SKU {{ displayedGlass.sku }}
          </div>
        </v-card-title>
        <v-card-subtitle class="pb-2 d-flex align-center">
          <span v-for="key in generalGlassesDataKeys" :key="key" class="pr-2">
            <span class="no-child-padding">
              <v-tooltip location="bottom" activator="parent">
                {{ glassesMetaUIData[key].desc }}
              </v-tooltip>
              <v-icon size="small">
                {{ glassesMetaUIData[key].icon }}
              </v-icon>
              {{ displayedGlass[key] }}
            </span>
          </span>
        </v-card-subtitle>
      </div>
      <div v-if="isGlassesResult(glasses)">
        <v-progress-circular
          class="mr-7 font-weight-bold"
          :model-value="convertScoreToPercentage(glasses.score)"
          :size="53"
          :width="7"
          :color="calcColorGradient(glasses.score)"
          :style="{ fontSize: '14px' }"
        >
          <template #default>
            {{ glasses.score.toFixed(2) }}
          </template>
        </v-progress-circular>
        <v-tooltip activator="parent" location="bottom">
          Result (Philscore) - lower values are better
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
              <div v-if="isGlassesResult(glasses)" class="d-flex align-center">
                <v-tooltip activator="parent" location="bottom">
                  PhilScore only for {{ eye.text }}
                </v-tooltip>
                <v-chip class="ml-2 px-2" size="x-small" label :ripple="false">
                  {{ (eye.key == 'od' ? glasses.odScore : glasses.osScore).toFixed(2) }}
                </v-chip>
              </div>
            </div>
            <tr v-for="dataKey in eyeDataKeys" :key="dataKey">
              <td class="text-medium-emphasis pr-2">
                {{ eyeUIData[dataKey].label }}
              </td>
              <td>
                <span>{{ displayedGlass[eye.key][dataKey] }} {{ eyeUIData[dataKey].suffix }}</span>
              </td>
            </tr>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions class="pt-0 mx-0" style="padding-left: 6px">
      <v-btn v-if="editable" variant="text" class="mx-0" @click="editDialogState = true">
        Edit
      </v-btn>
      <slot name="actions" />
    </v-card-actions>
  </v-card>

  <edit-dialog v-model:open="editDialogState" :glasses="glasses" />
</template>

<script setup lang="ts">
import { glassesMetaUIData } from '@/util/glasses-utils'
import {
  EyeKey,
  Glasses,
  GlassesEyeIndex,
  GlassesResult,
  eyeKeys,
  generalGlassesDataKeys,
} from '@/model/GlassesModel'
import { calcColorGradient } from '@/lib/color'
import { formatGlassesForDisplay } from '@/util/format-glasses'
import EditDialog from '@/components/EditDialog.vue'

const { editable = false } = defineProps<{ editable?: boolean }>()

const glasses = defineModel<Glasses | GlassesResult>('modelValue', { required: true })

const eyes: { text: string; key: GlassesEyeIndex }[] = [
  { text: 'OD', key: 'od' },
  { text: 'OS', key: 'os' },
]

const editDialogState = ref(false)
const loading = ref(false)
const eyeDataKeys = computed(() => {
  if (glasses.value.glassesType === 'multifocal') return eyeKeys
  else return eyeKeys.filter((k) => k !== 'add')
})

type EyeData = {
  label: string
  suffix: string
  step?: number
}
type EyeDataMap = {
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

const displayedGlass = computed(() => formatGlassesForDisplay(glasses.value))

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
</style>
