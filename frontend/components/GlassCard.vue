<template>
  <v-card
    outlined
    style="min-width: 250px;"
    class="mb-2"
  >
    <v-card-title class="text-uppercase">
      <div v-if="glass.score != null" class="d-flex align-center">
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
      <span class="text--secondary">SKU</span> {{ glass.sku.padStart(4, '0') }}
      <span class="pl-1">{{ glass.type }}</span>
    </v-card-title>
    <v-card-subtitle class="text--primary pb-2 d-flex align-center">
      <v-icon small class="mr-1">
        {{ mdiRuler }}
      </v-icon>
      {{ glass.size }}

      <v-icon small class="ml-3 mr-1">
        {{ mdiHumanMaleFemale }}
      </v-icon>
      {{ glass.appearance }}
    </v-card-subtitle>
    <v-card-text class="py-0">
      <v-container class="text--primary pa-0">
        <v-row dense>
          <v-col cols=6>
            <div class="text-subtitle-1">
              OD
            </div>
            <div><span class="text--secondary">Sphere:</span> {{ glass.odsphere }} D</div>
            <div><span class="text--secondary">Cyl:</span> {{ glass.odcylinder }}</div>
            <div><span class="text--secondary">Axis:</span> {{ glass.odaxis }}</div>
            <div v-if="glass.type !== 'single'">
              <span class="text--secondary">Add:</span> {{ glass.odadd }} D
            </div>
          </v-col>
          <v-col cols=6>
            <div class="text-subtitle-1">
              OS
            </div>
            <div><span class="text--secondary">Sphere:</span> {{ glass.ossphere }} D</div>
            <div><span class="text--secondary">Cyl:</span> {{ glass.oscylinder }}</div>
            <div><span class="text--secondary">Axis:</span> {{ glass.osaxis }}</div>
            <div v-if="glass.type !== 'single'">
              <span class="text--secondary">Add:</span> {{ glass.osadd }} D
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions class="pt-0">
      <v-btn
        text
        color="primary"
        @click="$emit('dispense', true)"
      >
        Dispense
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mdiRuler, mdiGlasses, mdiHumanMaleFemale } from '@mdi/js'
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
    mdiHumanMaleFemale
  }),
  methods: {
    calcColor(val) {
      const scale = chroma.scale(['#EF6C00', '#009688']).domain([1, 0])
      return scale(val).hex()
    }
  }
}
</script>
