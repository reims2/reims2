<template>
  <v-dialog v-model="dialogOpen" width="500">
    <v-card>
      <v-toolbar
        color="primary"
        :title="`Edit Glasses SKU ${glasses.sku?.toString().padStart(4, '0')}`"
      ></v-toolbar>
      <v-card-text>
        <glass-input
          :model-value="glassesInput"
          @update:model-value="(val) => updateGlasses(val)"
        ></glass-input>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogOpen = false">Save</v-btn>
        <v-btn variant="text" @click="dialogOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { DisplayedEye, Eye, Glasses, GlassesInput } from '@/model/GlassesModel'
import GlassInput from '@/components/GlassInput.vue'
const dialogOpen = defineModel<boolean>('open', { required: true })
const { glasses } = defineProps<{ glasses: Glasses }>()

const glassesInput: Ref<GlassesInput> = computed(() => {
  return {
    ...glasses,
    od: eyeToStringEye(glasses.od),
    os: eyeToStringEye(glasses.os),
  }
})

function eyeToStringEye(eye: Eye): DisplayedEye {
  return {
    sphere: eye.sphere.toFixed(2),
    cylinder: eye.cylinder.toFixed(2),
    axis: eye.axis.toFixed(0),
    add: eye.add?.toString(2) ?? '',
  }
}

function updateGlasses(val: GlassesInput) {
  // todo
}
</script>
