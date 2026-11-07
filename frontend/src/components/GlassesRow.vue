<template>
  <v-sheet
    role="group"
    :aria-label="`SKU ${displayed.sku}`"
    :color="isDone || selected ? 'surface-light' : 'surface'"
    class="d-flex flex-wrap align-center ga-4 pa-4"
  >
    <sku-tag
      :sku="displayed.sku ?? '????'"
      :state="state"
      :score="glasses.score"
      :blur-score="glasses.blurScore"
      :large="large"
    />
    <div class="d-flex flex-column ga-2 flex-1-1" :class="{ 'text-medium-emphasis': isDone }">
      <div
        class="d-flex flex-wrap align-center ga-3 text-body-small text-medium-emphasis text-capitalize"
      >
        <span v-for="key in factKeys" :key="key" class="d-inline-flex align-center ga-1">
          <v-tooltip activator="parent" location="bottom" :aria-label="glassesMetaUIData[key].desc">
            {{ glassesMetaUIData[key].desc }}
          </v-tooltip>
          <v-icon size="16" :icon="glassesMetaUIData[key].icon" />
          {{ glasses[key] }}
        </span>
      </div>
      <table
        class="align-self-start text-rx"
        :class="large ? 'text-title-large' : 'text-body-large'"
        style="border-collapse: collapse"
      >
        <tr v-for="eye in eyes" :key="eye.key">
          <th
            scope="row"
            class="text-left text-label-medium font-weight-bold pr-3"
            :class="isDone ? 'text-medium-emphasis' : eye.color"
          >
            {{ eye.text }}
          </th>
          <td
            v-for="field in diopterFields"
            :key="field.key"
            class="text-right text-no-wrap pr-3"
            style="min-width: 62px"
          >
            <v-tooltip
              activator="parent"
              location="bottom"
              :text="field.desc"
              :aria-label="field.desc"
            />
            {{ displayed[eye.key][field.key] }}
          </td>
          <td class="text-right text-no-wrap pr-3" style="min-width: 68px">
            <template v-if="glasses[eye.key].cylinder !== 0">
              <v-tooltip activator="parent" location="bottom" text="Axis" aria-label="Axis" />
              × {{ displayed[eye.key].axis }}
            </template>
          </td>
          <td v-if="glasses.glassesType === 'multifocal'" class="text-no-wrap pl-2">
            <v-tooltip
              activator="parent"
              location="bottom"
              text="Addition (Add)"
              aria-label="Addition (Add)"
            />
            <span class="text-label-medium text-medium-emphasis">Add</span>
            {{ displayed[eye.key].add }}
          </td>
        </tr>
      </table>
    </div>
    <div class="d-flex align-center justify-end ga-2 flex-shrink-0 ml-auto">
      <v-btn v-if="editable" variant="text" color="primary" @click="editDialogOpen = true">
        Edit
      </v-btn>
      <slot name="actions" />
    </div>
  </v-sheet>
  <edit-dialog v-if="editable" v-model:open="editDialogOpen" :glasses="glasses" />
</template>

<script setup lang="ts">
import { Glasses, GlassesEyeIndex } from '@/model/GlassesModel'
import { formatGlassesForDisplay } from '@/util/format-glasses'
import { glassesMetaUIData } from '@/util/glasses-utils'
import EditDialog from '@/components/EditDialog.vue'
import SkuTag from '@/components/SkuTag.vue'

const {
  glasses,
  editable = false,
  selected = false,
  large = false,
} = defineProps<{
  glasses: Glasses & { score?: number; blurScore?: number }
  editable?: boolean
  // the glasses loaded into a form, not a list entry
  selected?: boolean
  large?: boolean
}>()

const eyes: { text: string; key: GlassesEyeIndex; color: string }[] = [
  { text: 'OD', key: 'od', color: 'text-primary' },
  { text: 'OS', key: 'os', color: 'text-marigold' },
]

const diopterFields = [
  { key: 'sphere', desc: 'Sphere (SPH)' },
  { key: 'cylinder', desc: 'Cylinder (CYL)' },
] as const

const factKeys = ['glassesType', 'glassesSize', 'appearance'] as const

const editDialogOpen = ref(false)

const state = computed(() => {
  if (glasses.dispensed !== true) return 'stock'
  return glasses.dispense?.dispenseReason === 'DISPENSED' ? 'dispensed' : 'deleted'
})
const isDone = computed(() => state.value !== 'stock')

const displayed = computed(() => formatGlassesForDisplay(glasses))
</script>
