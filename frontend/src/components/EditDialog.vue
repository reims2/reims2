<template>
  <v-dialog v-model="dialogOpen" width="500">
    <v-card>
      <v-toolbar
        color="primary"
        :title="`Edit Glasses SKU ${originalGlasses.sku?.toString().padStart(4, '0')}`"
      ></v-toolbar>
      <v-card-text>
        <glass-input v-model="glassesInput"></glass-input>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="updateGlasses()">Save</v-btn>
        <v-btn variant="text" @click="dialogOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { DisplayedEye, Eye, Glasses, GlassesInput } from '@/model/GlassesModel'
import GlassInput from '@/components/GlassInput.vue'
const dialogOpen = defineModel<boolean>('open', { required: true })
const originalGlasses = defineModel<Glasses>('glasses', { required: true })

const glassesInput: Ref<GlassesInput> = ref(convertGlassesToGlassesInput(originalGlasses.value))

watch(dialogOpen, (open) => {
  if (open) {
    glassesInput.value = convertGlassesToGlassesInput(originalGlasses.value)
  }
})

function convertGlassesToGlassesInput(val: Glasses): GlassesInput {
  return {
    ...val,
    od: eyeToStringEye(val.od),
    os: eyeToStringEye(val.os),
  }
}

function eyeToStringEye(eye: Eye): DisplayedEye {
  return {
    sphere: eye.sphere.toFixed(2),
    cylinder: eye.cylinder.toFixed(2),
    axis: eye.axis.toString().padStart(3, '0'),
    add: eye.add?.toFixed(2) ?? '',
  }
}

function updateGlasses() {
  // todo
  dialogOpen.value = false
}
</script>
