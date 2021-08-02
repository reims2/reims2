<template>
  <v-card
    style="min-width: 290px;"
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
            <div class="text-subtitle-1">
              {{ eye.text }}
            </div>
            <tr>
              <td class="text--secondary pr-2">
                Sphere
              </td>
              <td>{{ formatNumber(glass[eye.key].sphere, 2) }} D</td>
            </tr>
            <tr>
              <td class="text--secondary pr-2">
                Cyl
              </td>
              <td>{{ formatNumber(glass[eye.key].cylinder, 2) }}</td>
            </tr>
            <tr>
              <td class="text--secondary pr-2">
                Axis
              </td>
              <td>{{ glass[eye.key].axis.toString().padStart(3,'0') }}</td>
            </tr>
            <tr v-if="glass.glassesType !== 'single'">
              <td class="text--secondary pr-2">
                Add
              </td>
              <td>{{ formatNumber(glass[eye.key].add, 2) }} D</td>
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

export default {
  props: {
    glass: {
      type: Object,
      required: true
    },
    noActions: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    mdiArrowUpDown,
    mdiGlasses,
    mdiHumanMaleFemale,
    eyes: [{
      text: 'OD',
      key: 'od'
    },
    {
      text: 'OS',
      key: 'os'
    }]
  }),
  methods: {
    calcColor(val) {
      const scale = chroma.scale(['#EF6C00', '#009688']).domain([1, 0])
      return scale(val).hex()
    },
    formatNumber(val, decimals) {
      return (val < 0 ? '-' : '+') + Math.abs(Number(val)).toFixed(decimals)
    }
  }

}
</script>
