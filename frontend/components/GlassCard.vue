<template>
  <v-card
    style="min-width: 270px;"
    class="mb-2"
  >
    <v-card-title>
      <div v-if="glass.score != null" class="d-flex align-center">
        <v-chip
          class="mr-2 px-2 white--text font-weight-medium"
          :color="calcColor(glass.score)"
          small
          label
          :ripple="false"
        >
          {{ glass.score.toFixed(2) }}
        </v-chip>
      </div>
      <span class="text--secondary">SKU</span> {{ glass.sku.toString().padStart(4, '0') }}
    </v-card-title>
    <v-card-subtitle class="text--primary pb-2 d-flex align-center">
      <v-icon small class="mr-1">
        {{ mdiGlasses }}
      </v-icon>
      {{ glass.glassesType }}
      <v-icon small class="ml-3 mr-1">
        {{ mdiArrowUpDown }}
      </v-icon>
      {{ glass.glassesSize }}

      <v-icon small class="ml-3 mr-1">
        {{ mdiHumanMaleFemale }}
      </v-icon>
      {{ glass.appearance }}
    </v-card-subtitle>
    <v-card-text :class="[noActions ? '' :'py-0']">
      <v-container class="text--primary pa-0">
        <v-row dense>
          <v-col v-for="eye in eyes" :key="eye.key" cols=6>
            <div class="d-flex">
              <div class="text-subtitle-1">
                {{ eye.text }}
              </div>
              <div v-if="glass.score != null" class="d-flex align-center">
                <v-chip
                  class="ml-2 px-2"
                  x-small
                  label
                  :ripple="false"
                >
                  {{ (eye.key == 'od' ? glass.odScore : glass.osScore).toFixed(2) }}
                </v-chip>
              </div>
            </div>
            <tr v-for="[dataKey, dataItem] in Object.entries(eyeData)" :key="dataKey" @click="edit = eye.key + dataKey">
              <td class="text--secondary pr-2">
                {{ dataItem.label }}
              </td>
              <td>
                <editable-span
                  :value="dataItem.format(glass[eye.key][dataKey])"
                  :suffix="dataItem.suffix"
                  :rules="eyeRules[dataKey]"
                  :is-editing="editable && edit == eye.key + dataKey"
                  @change="edit = ''"
                />
              </td>
            </tr>
          </v-col>
        </v-row>
        <div v-if="editable" class="caption text--secondary pt-1">
          Click any value to edit
        </div>
      </v-container>
    </v-card-text>
    <v-card-actions v-if="!noActions" class="pt-0">
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script>
import { mdiArrowUpDown, mdiGlasses, mdiHumanMaleFemale } from '@mdi/js'
import * as chroma from '../lib/chroma'
import EditableSpan from './EditableSpan.vue'
import { eyeRules } from '~/lib/util'

export default {
  components: { EditableSpan },
  props: {
    glass: {
      type: Object,
      required: true
    },
    noActions: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    mdiArrowUpDown,
    mdiGlasses,
    mdiHumanMaleFemale,
    eyeRules,
    eyes: [{
      text: 'OD',
      key: 'od'
    },
    {
      text: 'OS',
      key: 'os'
    }],
    edit: ''
  }),
  computed: {
    eyeData() {
      return {
        sphere: {
          label: 'SPH',
          format: v => this.formatNumber(v, 2),
          enabled: true,
          suffix: 'D'
        },
        cylinder: {
          label: 'CYL',
          format: v => this.formatNumber(v, 2),
          enabled: true,
          suffix: 'D'
        },
        axis: {
          label: 'Axis',
          format: v => parseInt(v).toString().padStart(3, '0'),
          enabled: true,
          suffix: ''
        },
        add: {
          label: 'Add',
          format: v => this.formatNumber(v, 2),
          enabled: this.glass.glassesType !== 'single',
          suffix: 'D'
        }
      }
    }
  },
  methods: {
    calcColor(val) {
      const scale = chroma.scale(['#BF360C', '#FF9800', '#009688']).domain([2.0, 1.0, 0])
      return scale(val).hex()
    },
    formatNumber(val, decimals) {
      return (val < 0 ? '-' : '+') + Math.abs(Number(val)).toFixed(decimals)
    }
  }

}
</script>
