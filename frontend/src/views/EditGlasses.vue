<template>
  <v-container>
    <v-row dense class="justify-center">
      <v-col cols="12" md="6" lg="5">
        <div class="pb-2">Start by entering a SKU to dispense or edit glasses.</div>
        <v-form ref="form" v-model="valid" class="pt-3" @submit.prevent="startDispension">
          <v-row>
            <v-col cols="12">
              <select-glasses-input
                ref="firstInput"
                v-model:sku="inputSku"
                v-model:error-messsage="errorMesssage"
                :loading="isLoading"
                hint-for-selected="Press ENTER to dispense"
                style="max-width: 500px"
                @change="(glasses) => (selected = glasses)"
              ></select-glasses-input>
            </v-col>
            <v-col v-if="selected">
              <div class="d-flex flex-shrink-1 justify-start">
                <glass-card :key="selected.key" :model-value="selected" editable>
                  <template #actions>
                    <v-btn variant="text" class="mx-0" @click="startDispension">Dispense</v-btn>
                    <div class="d-flex flex-grow-1 justify-end">
                      <v-menu offset-y left>
                        <template #activator="{ props }">
                          <v-btn icon v-bind="props">
                            <v-icon>{{ mdiDotsVertical }}</v-icon>
                          </v-btn>
                        </template>
                        <v-list density="compact">
                          <v-list-item>
                            <delete-button
                              :glass="selected"
                              @delete="(reason) => submitDeletion(reason)"
                            />
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </template>
                </glass-card>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-col>

      <v-col v-if="lastDispensed.length > 0" cols="12" md="4" lg="3" class="pl-md-6 pt-3 pt-md-2">
        <div class="text-h6 pb-2">Recently dispensed or deleted</div>
        <div v-for="glasses in lastDispensed" :key="glasses.sku" style="opacity: 80%">
          <glass-card :model-value="glasses">
            <template #actions>
              <v-btn variant="text" color="red" class="mx-0" @click="undoDispension(glasses)">
                Undo
              </v-btn>
            </template>
          </glass-card>
        </div>
      </v-col>
    </v-row>

    <v-snackbar
      v-if="snackbarMessage != ''"
      :model-value="true"
      :timeout="-1"
      vertical
      location="bottom center"
      :attach="true"
      max-width="300px"
      class="position"
    >
      <template #actions>
        <v-btn variant="text" color="primary-lighten-3" @click="snackbarMessage = ''">Close</v-btn>
      </template>
      <span>{{ snackbarMessage }}</span>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { mdiDotsVertical } from '@mdi/js'

import SelectGlassesInput from '@/components/SelectGlassesInput.vue'
import { Glasses } from '@/model/GlassesModel'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useRoute } from 'vue-router'
import { useEditGlasses } from '@/lib/edit'

const GlassCard = defineAsyncComponent(() => import('@/components/GlassCard.vue'))
const DeleteButton = defineAsyncComponent(() => import('@/components/DeleteButton.vue'))

type GlassesWithKey = Glasses & { key?: string }

const valid = ref(false)
const errorMesssage = ref('')
const selected = ref<GlassesWithKey | null>(null)
const inputSku = ref<number | null>(null)

// Component refs
const form = ref<VForm | null>(null)
const firstInput = ref<ComponentPublicInstance | null>(null)

const { isLoading, lastDispensed, submitDeletion, undoDispension, snackbarMessage } =
  useEditGlasses(selected, onDeleted)

const route = useRoute()
onActivated(() => {
  if (route.query.sku != null) {
    inputSku.value = parseInt(route.query.sku as string)
  }
})

function startDispension() {
  if (!selected.value) {
    errorMesssage.value = 'SKU not found'
    return
  }
  submitDeletion('DISPENSED')
}

function onDeleted() {
  firstInput.value?.$el.focus()
  form.value?.reset()
}
</script>

<style scoped>
.position {
  bottom: 50px;
}
</style>
