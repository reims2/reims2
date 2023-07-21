<template>
  <v-container>
    <v-row dense class="justify-center">
      <v-col cols="12" md="6" lg="4">
        <div class="pb-2">Start by entering a SKU to dispense or edit glasses.</div>
        <v-form ref="form" v-model="valid" class="pt-3" @submit.prevent="submitDispension">
          <v-row>
            <v-col cols="12">
              <v-text-field
                ref="firstInput"
                v-model.number="sku"
                :autofocus="!mobile"
                label="SKU"
                type="number"
                :hint="hint"
                persistent-hint
                :loading="isLoading"
                :error-messages="errorMesssage"
                :success-messages="successMessage"
              />
            </v-col>
            <v-col v-if="selected">
              <div class="d-flex flex-shrink-1 justify-start">
                <glass-card :key="selected.key" :model-value="selected" editable>
                  <template #actions>
                    <v-btn variant="text" class="mx-0" @click="submitDispension">Dispense</v-btn>
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
    </v-row>
    <v-snackbar
      v-if="snackbarMessage != ''"
      :model-value="true"
      :timeout="-1"
      vertical
      :attach="true"
    >
      <template #actions>
        <v-btn v-if="lastDispensed != null" variant="text" @click="undoDispension(lastDispensed)">
          Undo
        </v-btn>
        <v-btn variant="text" color="primary-lighten-3" @click="snackbarMessage = ''">Close</v-btn>
      </template>
      <span>{{ snackbarMessage }}</span>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { mdiDotsVertical } from '@mdi/js'
import { useGlassesStore } from '@/stores/glasses'

import GlassCard from '@/components/GlassCard.vue'
import DeleteButton from '@/components/DeleteButton.vue'
import { Glasses } from '@/model/GlassesModel'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useRouteQuery } from '@vueuse/router'

import { useDisplay } from 'vuetify'
import { useNotification } from '@/lib/notifications'
const { addError } = useNotification()
const { mobile } = useDisplay()

const glassesStore = useGlassesStore()

type GlassesWithKey = Glasses & { key?: string }

const valid = ref(false)
const sku = ref('')
const lastDispensed = ref<Glasses | null>(null)
const isLoading = ref(false)
const snackbarMessage = ref('')
const successMessage = ref('')
const errorMesssage = ref('')
const hint = ref('')
const selected = ref<GlassesWithKey | null>(null)

// Component refs
const form = ref<VForm | null>(null)
const firstInput = ref<HTMLElement | null>(null)

watch(sku, async () => {
  if (sku.value !== '') {
    successMessage.value = ''
    errorMesssage.value = ''
    selected.value = glassesStore.getGlassLocal(parseInt(sku.value))
    if (!selected.value) hint.value = ''
    // also fetch glasses in background to update database
    selected.value = await glassesStore.fetchSingle(parseInt(sku.value))
  } else {
    selected.value = null
    hint.value = ''
  }
})

watch(
  () => glassesStore.allGlasses,
  () => {
    selected.value = glassesStore.getGlassLocal(parseInt(sku.value))
  },
)

watch(selected, () => {
  if (selected.value) {
    hint.value = 'Press ENTER to dispense'
  }
})

const querySku = useRouteQuery('sku')
watch(
  querySku,
  () => {
    if (querySku.value) {
      if (Array.isArray(querySku.value)) {
        sku.value = querySku.value[0]
      } else sku.value = querySku.value
    }
  },
  { immediate: true },
)

async function submitDispension() {
  await submitDeletion('DISPENSED')
}

async function submitDeletion(reason: string) {
  if (isLoading.value || sku.value == null || sku.value === '') return
  if (!selected.value) {
    errorMesssage.value = 'SKU not found'
    return
  }
  // copy object because the computed `selected` property will get null when it's dispensed
  const toDispense = selected.value
  // do dispension
  snackbarMessage.value = ''
  errorMesssage.value = ''
  isLoading.value = true
  lastDispensed.value = null
  try {
    await glassesStore.dispense(toDispense.sku, reason)
  } catch (error) {
    isLoading.value = false
    if (error.status === 404) {
      addError('SKU ' + toDispense.sku + ' not found on server, was it already dispensed?')
    } else if (error.network || error.server) {
      if (error.server) {
        addError(
          `Server error. But the glasses will be automatically dispensed as soon as the server is reachable (Error ${error.status})`,
        )
        snackbarMessage.value = `Glasses with SKU ${toDispense.sku} will be dispensed when the server is back online`
        glassesStore.deleteOfflineGlasses(toDispense.sku)
      } else {
        snackbarMessage.value = `Glasses with SKU ${toDispense.sku} will be dispensed when you're back online`
      }
      lastDispensed.value = toDispense
      if (form.value) form.value.reset()
      if (firstInput.value) firstInput.value.focus()
    } else {
      addError(`Could not dispense glasses, please retry (Error ${error.status})`)
    }
    return
  }
  isLoading.value = false
  lastDispensed.value = toDispense

  if (reason === 'DISPENSED') {
    snackbarMessage.value = `Successfully dispensed glasses with SKU ${toDispense.sku}`
    successMessage.value = 'Dispension successful'
  } else {
    snackbarMessage.value = `Successfully deleted glasses with SKU ${toDispense.sku}`
  }
  if (form.value) form.value.reset()
  if (firstInput.value) firstInput.value.focus()
}

async function undoDispension(glasses: Glasses) {
  isLoading.value = true
  try {
    await glassesStore.undispense(glasses)
  } catch (error) {
    isLoading.value = false
    if (error.status === 400) {
      addError(
        `Sorry, reverting the dispension is not possible. Please readd glasses manually (Error ${error.status}).`,
      )
      snackbarMessage.value = ''
    } else if (error.network || error.server) {
      addError(
        "Network or server error. Dispension will be automatically reverted as soon as you're back online.",
      )
      snackbarMessage.value = ''
    } else {
      addError(`Could not undo dispension of glasses, please retry (Error ${error.status}).`)
    }
    return
  }
  isLoading.value = false
  lastDispensed.value = null
  sku.value = glasses.sku.toString()
  snackbarMessage.value = `Reverted dispension/deletion of SKU ${glasses.sku} successfully`
}
</script>
