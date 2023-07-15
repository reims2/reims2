<template>
  <v-container>
    <v-row dense class="justify-center">
      <v-col cols="12" md="6" lg="4">
        <div class="text--secondary pb-2">Start by entering a SKU to dispense or edit glasses.</div>
        <v-form ref="form" v-model="valid" class="pt-3" @submit.prevent="submitDispension">
          <v-row>
            <v-col cols="12">
              <v-text-field
                ref="firstInput"
                v-model.number="sku"
                :autofocus="!rootStore.isMobile"
                label="SKU"
                type="number"
                :hint="hint"
                persistent-hint
                :loading="isLoading"
                :error-messages="errorMesssage"
                :success-messages="successMessage"
                outlined
              />
            </v-col>
            <v-col v-if="selected">
              <div class="d-flex flex-shrink-1 justify-start">
                <glass-card :key="selected.key" :glass="selected" editable>
                  <template #actions>
                    <v-btn variant="text" class="mx-0" @click="submitDispension">Dispense</v-btn>
                    <div class="d-flex flex-grow-1 justify-end">
                      <v-menu offset-y left>
                        <template #activator="{ props }">
                          <v-btn icon v-bind="props">
                            <v-icon>{{ mdiDotsVertical }}</v-icon>
                          </v-btn>
                        </template>
                        <v-list dense>
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
    <v-snackbar v-if="snackbarMessage != ''" :value="true" :timeout="-1" vertical absolute bottom>
      <template v-slot:actions>
        <v-btn v-if="lastDispensed != null" variant="text" @click="undoDispension(lastDispensed)">
          Undo
        </v-btn>
        <v-btn variant="text" color="primary lighten-3" @click="snackbarMessage = ''">Close</v-btn>
      </template>
      <span>{{ snackbarMessage }}</span>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { mdiDotsVertical } from '@mdi/js'
import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'
import GlassCard from '@/components/GlassCard.vue'
import DeleteButton from '@/components/DeleteButton.vue'
import { Glasses } from '@/model/GlassesModel'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useRouteQuery } from '@vueuse/router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Edit Glasses',
})

const glassesStore = useGlassesStore()
const rootStore = useRootStore()

const valid = ref(false)
const sku = ref('')
const lastDispensed = ref(null)
const isLoading = ref(false)
const snackbarMessage = ref('')
const successMessage = ref('')
const errorMesssage = ref('')
const hint = ref('')
const selected = ref<any>(null)

// Component refs
const form = ref<VForm | null>(null)
const firstInput = ref<any | null>(null)

watch(sku, async (newSku, oldSku) => {
  if (newSku != null && newSku !== '') {
    successMessage.value = ''
    // also fetch glasses in background to update database
    const returnValue = (await glassesStore.fetchSingle(parseInt(newSku))) as any
    selected.value = returnValue
    // horrible hack to always refresh the virtual DOM if something changed
    if (returnValue) {
      selected.value.key = '' + selected.value.sku + Math.floor(Math.random() * 10000).toString()
      hint.value = 'Press ENTER to dispense'
    } else {
      hint.value = 'SKU not found'
    }
  } else {
    selected.value = null
    hint.value = ''
  }
  errorMesssage.value = ''
})

const querySku = useRouteQuery('sku')
watchEffect(() => {
  if (querySku.value) {
    if (Array.isArray(querySku.value)) {
      sku.value = querySku.value[0]
    } else sku.value = querySku.value
  }
})

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
      rootStore.setError(
        'SKU ' + toDispense.sku + ' not found on server, was it already dispensed?',
      )
    } else if (error.network || error.server) {
      if (error.server) {
        rootStore.setError(
          `Server error. But the glasses will be automatically dispensed as soon as the server is reachable (Error ${error.status})`,
        )
        snackbarMessage.value = `Glasses with SKU ${toDispense.sku} will be dispensed when the server is back online`
        rootStore.deleteOfflineGlasses(toDispense.sku)
      } else {
        snackbarMessage.value = `Glasses with SKU ${toDispense.sku} will be dispensed when you're back online`
      }
      lastDispensed.value = toDispense
      if (form.value) form.value.reset()
      if (firstInput.value) firstInput.value.focus()
    } else {
      rootStore.setError(`Could not dispense glasses, please retry (Error ${error.status})`)
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
      rootStore.setError(
        `Sorry, reverting the dispension is not possible. Please readd glasses manually (Error ${error.status}).`,
      )
      snackbarMessage.value = ''
    } else if (error.network || error.server) {
      rootStore.setError(
        "Network or server error. Dispension will be automatically reverted as soon as you're back online.",
      )
      snackbarMessage.value = ''
    } else {
      rootStore.setError(
        `Could not undo dispension of glasses, please retry (Error ${error.status}).`,
      )
    }
    return
  }
  isLoading.value = false
  lastDispensed.value = null
  sku.value = glasses.sku.toString()
  snackbarMessage.value = `Reverted dispension/deletion of SKU ${glasses.sku} successfully`
}
</script>
