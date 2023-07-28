<template>
  <v-container>
    <v-row dense class="justify-center">
      <v-col cols="12" md="6" lg="5">
        <div class="pb-2">Start by entering a SKU to dispense or edit glasses.</div>
        <v-form ref="form" v-model="valid" class="pt-3" @submit.prevent="submitDispension">
          <v-row>
            <v-col cols="12">
              <select-glasses-input
                ref="firstInput"
                v-model:sku="inputSku"
                v-model:error-messsage="errorMesssage"
                :loading="isLoading"
                hint-for-selected="Press ENTER to dispense"
                @change="(glasses) => (selected = glasses)"
                style="max-width: 500px"
              ></select-glasses-input>
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

      <v-col
        v-if="rootStore.lastDisensedGlasses.length > 0"
        cols="12"
        md="4"
        lg="3"
        class="pl-md-6 pt-3 pt-md-2"
      >
        <div class="text-h6 pb-2">Last dispensed or deleted</div>
        <div
          v-for="glasses in rootStore.lastDisensedGlasses.slice(0, 3)"
          :key="glasses.sku"
          style="opacity: 80%"
        >
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
import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'

import SelectGlassesInput from '@/components/SelectGlassesInput.vue'
import { Glasses } from '@/model/GlassesModel'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useRoute } from 'vue-router'

import { useToast } from 'vue-toastification'

const GlassCard = defineAsyncComponent(() => import('@/components/GlassCard.vue'))
const DeleteButton = defineAsyncComponent(() => import('@/components/DeleteButton.vue'))

const toast = useToast()

const glassesStore = useGlassesStore()
const rootStore = useRootStore()

type GlassesWithKey = Glasses & { key?: string }

const valid = ref(false)
const isLoading = ref(false)
const snackbarMessage = ref('')
const errorMesssage = ref('')
const selected = ref<GlassesWithKey | null>(null)
const inputSku = ref<number | null>(null)

// Component refs
const form = ref<VForm | null>(null)
const firstInput = ref<ComponentPublicInstance | null>(null)

const route = useRoute()
onActivated(() => {
  if (route.query.sku != null) {
    inputSku.value = parseInt(route.query.sku as string)
  }
})

async function submitDispension() {
  await submitDeletion('DISPENSED')
}

async function submitDeletion(reason: string) {
  if (isLoading.value) return
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
  try {
    await glassesStore.dispense(toDispense.sku, reason)
  } catch (error) {
    isLoading.value = false
    if (error.status === 404) {
      toast.warning('SKU ' + toDispense.sku + ' not found on server, was it already dispensed?')
    } else if (error.network || error.server) {
      if (error.server) {
        toast.warning(
          `Server error. But the glasses will be automatically dispensed as soon as the server is reachable (Error ${error.status})`,
        )
        snackbarMessage.value = `Glasses with SKU ${toDispense.sku} will be dispensed when the server is back online`
        glassesStore.deleteOfflineGlasses(toDispense.sku)
      } else {
        snackbarMessage.value = `Glasses with SKU ${toDispense.sku} will be dispensed when you're back online`
      }
      rootStore.lastDisensedGlasses.unshift(toDispense)
      if (form.value) form.value.reset()
      if (firstInput.value) firstInput.value.$el.focus()
    } else {
      toast.error(`Could not dispense glasses, please retry (Error ${error.status})`)
    }
    return
  }
  isLoading.value = false
  rootStore.lastDisensedGlasses.unshift(toDispense)

  if (reason === 'DISPENSED') {
    snackbarMessage.value = `Successfully dispensed glasses with SKU ${toDispense.sku}`
  } else {
    snackbarMessage.value = `Successfully deleted glasses with SKU ${toDispense.sku}`
  }
  if (form.value) form.value.reset()
  if (firstInput.value) firstInput.value.$el.focus()
}

async function undoDispension(glasses: Glasses) {
  isLoading.value = true
  try {
    await glassesStore.undispense(glasses)
  } catch (error) {
    isLoading.value = false
    if (error.status === 400) {
      toast.error(
        `Sorry, reverting the dispension is not possible. Please readd glasses manually (Error ${error.status}).`,
      )
      snackbarMessage.value = ''
    } else if (error.network || error.server) {
      toast.error(
        "Network or server error. Dispension will be automatically reverted as soon as you're back online.",
      )
      snackbarMessage.value = ''
    } else {
      toast.error(`Could not undo dispension of glasses, please retry (Error ${error.status}).`)
    }
    return
  }
  isLoading.value = false
  rootStore.lastDisensedGlasses = rootStore.lastDisensedGlasses.filter((g) => g.sku !== glasses.sku)
  inputSku.value = glasses.sku
  snackbarMessage.value = `Reverted dispension/deletion of SKU ${glasses.sku} successfully`
}
</script>

<style scoped>
.position {
  bottom: 50px;
}
</style>
