<template>
  <v-card
    style="min-width: 270px;"
    class="mb-2"
  >
    <v-card-title v-if="glass.sku">
      <div v-if="glass.score != null" class="d-flex align-center">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-chip
              class="mr-2 px-2 white--text font-weight-medium"
              :color="calcColor(glass.score)"
              small
              label
              :ripple="false"
              v-bind="attrs"
              v-on="on"
            >
              {{ glass.score.toFixed(2) }}
            </v-chip>
          </template>
          Result (Philscore) - lower values are better
        </v-tooltip>
      </div>
      <span class="text--secondary">SKU</span> {{ glass.sku.toString().padStart(4, '0') }}
    </v-card-title>
    <v-card-subtitle class="text--primary pb-2 d-flex align-center">
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <span v-bind="attrs" v-on="on">
            <v-icon small>
              {{ mdiGlasses }}
            </v-icon>
            {{ glass.glassesType }}
          </span>
        </template>
        Glasses type (either bifocal or single)
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <span v-bind="attrs" v-on="on">
            <v-icon small class="ml-2">
              {{ mdiArrowUpDown }}
            </v-icon>
            {{ glass.glassesSize }}
          </span>
        </template>
        Glasses size (small to large)
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <span v-bind="attrs" v-on="on">
            <v-icon small class="ml-2">
              {{ mdiHumanMaleFemale }}
            </v-icon>
            {{ glass.appearance }}
          </span>
        </template>
        Glasses appearance (neutral, feminine or masculine)
      </v-tooltip>
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
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-chip
                      class="ml-2 px-2"
                      x-small
                      label
                      :ripple="false"
                      v-bind="attrs"
                      v-on="on"
                    >
                      {{ (eye.key == 'od' ? glass.odScore : glass.osScore).toFixed(2) }}
                    </v-chip>
                  </template>
                  PhilScore only for {{ eye.text }}
                </v-tooltip>
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
      const data = {
        sphere: {
          label: 'SPH',
          format: v => this.formatNumber(v, 2),
          suffix: 'D'
        },
        cylinder: {
          label: 'CYL',
          format: v => this.formatNumber(v, 2),
          suffix: 'D'
        },
        axis: {
          label: 'Axis',
          format: v => parseInt(v).toString().padStart(3, '0'),
          suffix: ''
        }
      }
      if (this.glass.glassesType !== 'single') {
        data.add = {
          label: 'Add',
          format: v => this.formatNumber(v, 2),
          suffix: 'D'
        }
      }
      return data
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
