<template>
  <v-card
    outlined
    style="min-width: 250px;"
    class="mb-2"
  >
    <v-card-title class="text-uppercase">
      <div v-if="glass.score" class="d-flex align-center">
        <v-chip
          class="mr-2 px-2 white--text font-weight-medium"
          :color="calcColor(glass.score)"
          small
          label
          :ripple="false"
        >
          {{ glass.score }}
        </v-chip>
      </div>
      <span class="pr-1 text--secondary">SKU</span> {{ glass.SKU.padStart(4, '0') }}
    </v-card-title>
    <v-card-subtitle class="text--primary pb-2 d-flex align-center">
      <v-icon small class="mr-1">
        {{ mdiGlasses }}
      </v-icon>
      {{ glass.TYPE }}

      <v-icon small class="ml-3 mr-1">
        {{ mdiRuler }}
      </v-icon>
      {{ glass.SIZE }}

      <v-icon small class="ml-3 mr-1">
        {{ mdiHumanMaleFemale }}
      </v-icon>
      {{ glass.APPEARANCE }}

      <span v-if="glass.MATERIAL">
        <v-icon small class="ml-3">
          {{ mdiHammerScrewdriver }}
        </v-icon>
        {{ glass.MATERIAL }}
      </span>
    </v-card-subtitle>
    <v-card-text class="py-0">
      <v-container class="text--primary pa-0">
        <v-row dense>
          <v-col cols=6>
            <div class="text-subtitle-1">
              OD
            </div>
            <div><span class="text--secondary">Sphere:</span> {{ glass.ODSPHERE }} D</div>
            <div><span class="text--secondary">Cyl:</span> {{ glass.ODCYLINDER }}</div>
            <div><span class="text--secondary">Axis:</span> {{ glass.ODAXIS }}</div>
            <div v-if="glass.TYPE !== 'single'">
              <span class="text--secondary">Add:</span> {{ glass.ODADD }} D
            </div>
          </v-col>
          <v-col cols=6>
            <div class="text-subtitle-1">
              OS
            </div>
            <div><span class="text--secondary">Sphere:</span> {{ glass.OSSPHERE }} D</div>
            <div><span class="text--secondary">Cyl:</span> {{ glass.OSCYLINDER }}</div>
            <div><span class="text--secondary">Axis:</span> {{ glass.OSAXIS }}</div>
            <div v-if="glass.TYPE !== 'single'">
              <span class="text--secondary">Add:</span> {{ glass.OSADD }} D
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions class="pt-0">
      <v-btn
        text
        color="primary"
        @click="$emit('dispense', $evt)"
      >
        Dispense
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mdiRuler, mdiGlasses, mdiHumanMaleFemale, mdiHammerScrewdriver } from '@mdi/js'
import * as chroma from '../lib/chroma'

export default {
  props: {
    glass: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    mdiRuler,
    mdiGlasses,
    mdiHumanMaleFemale,
    mdiHammerScrewdriver
  }),
  methods: {
    calcColor(val) {
      const scale = chroma.scale(['#EF6C00', '#009688']).domain([1, 0])
      return scale(val).hex()
    }
  }
}
</script>
