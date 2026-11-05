<template>
  <page-layout title="Dispense or edit">
    <v-col cols="12" md="5">
      <v-form ref="form" v-model="valid" @submit.prevent="startDispension">
        <page-card title="Glasses by SKU" :icon="mdiGlasses">
          <div class="px-6 pt-6 pb-5">
            <select-glasses-input
              ref="firstInput"
              v-model:sku="inputSku"
              v-model:error-message="errorMessage"
              :loading="isLoading"
              hint="Type a SKU to load the glasses"
              @change="(glasses) => (selected = glasses)"
            ></select-glasses-input>
          </div>
          <v-sheet
            v-if="selected"
            border
            rounded="lg"
            class="mx-6 mb-6 overflow-hidden"
            aria-label="Glasses result"
            role="region"
          >
            <glasses-row :glasses="selected" selected />
          </v-sheet>
          <template #footer>
            <div class="d-flex align-center ga-1 ml-n3">
              <template v-if="selected">
                <v-btn
                  variant="text"
                  color="primary"
                  :prepend-icon="mdiPencilOutline"
                  @click="editDialogOpen = true"
                >
                  Edit
                </v-btn>
                <delete-button :glass="selected" @delete="(reason) => submitDeletion(reason)" />
              </template>
            </div>
            <v-spacer />
            <v-btn
              color="primary"
              size="large"
              variant="flat"
              elevation="2"
              type="submit"
              :prepend-icon="mdiCheck"
            >
              Dispense
              <v-chip size="x-small" label variant="tonal" class="ml-3 font-weight-bold">
                Enter
              </v-chip>
            </v-btn>
          </template>
        </page-card>
      </v-form>
    </v-col>
    <edit-dialog v-if="selected" v-model:open="editDialogOpen" :glasses="selected" />

    <v-col cols="12" md="7">
      <page-card title="Recently dispensed or deleted" :icon="mdiHistory" tone="marigold">
        <template #header>
          <v-progress-circular
            v-if="isLastDispensedLoading"
            indeterminate
            size="20"
            width="2"
            color="primary"
            aria-label="Loading recently dispensed glasses"
          ></v-progress-circular>
        </template>
        <div v-if="!isOnline" class="pa-6">
          <v-alert type="warning" variant="tonal" density="comfortable" :icon="mdiCloudOffOutline">
            Go online to view recently dispensed glasses
          </v-alert>
        </div>
        <p
          v-else-if="lastDispensed.length == 0"
          class="pa-6 ma-0 text-body-medium text-medium-emphasis"
        >
          No glasses were dispensed or deleted recently.
        </p>
        <div v-else>
          <div
            v-for="(glasses, idx) in lastDispensed"
            :key="glasses.id"
            :data-testid="'result-' + idx"
          >
            <v-divider v-if="idx > 0" />
            <glasses-row :glasses="glasses" :celebrate="glasses.id === justDispensedId">
              <template #actions>
                <v-btn variant="text" color="primary" @click="undoDispension(glasses)">Undo</v-btn>
              </template>
            </glasses-row>
          </div>
        </div>
      </page-card>
    </v-col>
  </page-layout>
</template>

<script setup lang="ts">
import { mdiCheck, mdiCloudOffOutline, mdiGlasses, mdiHistory, mdiPencilOutline } from '@mdi/js'

import SelectGlassesInput from '@/components/SelectGlassesInput.vue'
import GlassesRow from '@/components/GlassesRow.vue'
import DeleteButton from '@/components/DeleteButton.vue'
import EditDialog from '@/components/EditDialog.vue'
import PageLayout from '@/components/PageLayout.vue'
import PageCard from '@/components/PageCard.vue'
import { Glasses } from '@/model/GlassesModel'
import { useRoute } from 'vue-router'
import { useEditGlasses } from '@/composables/edit'
import { useOnline } from '@vueuse/core'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()

const isOnline = useOnline()

const valid = ref(false)
const errorMessage = ref('')
const selected = ref<Glasses | null>(null)
const inputSku = ref<number | null>(null)
const editDialogOpen = ref(false)

// Component refs
const form = useTemplateRef('form')
const firstInput = useTemplateRef('firstInput')

const { isLoading, lastDispensed, isLastDispensedLoading, submitDeletion, undoDispension } =
  useEditGlasses(selected, onDeleted)

const route = useRoute()
onActivated(() => {
  if (route.query.sku != null) {
    inputSku.value = parseInt(route.query.sku as string)
  }
})

// the pair that lands at the top of the list gets the dispense animation
const justDispensedId = ref<number | null>(null)

function startDispension() {
  if (!selected.value) {
    errorMessage.value = 'SKU not found'
    return
  }
  justDispensedId.value = selected.value.id
  submitDeletion('DISPENSED')
}

watchEffect(() => {
  if (selected.value) errorMessage.value = ''
})

function onDeleted() {
  if (!mobile.value) firstInput.value?.focus()
  form.value?.reset()
}
</script>
