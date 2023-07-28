<template>
  <v-container @keyup.a="submit">
    <v-row class="justify-center" dense>
      <v-col cols="12" md="6" lg="4" class="pb-2 px-2 pt-4">
        <v-form ref="form" v-model="valid" @submit.prevent>
          <v-row dense>
            <v-col v-for="item in generalGlassesDataKeys" :key="item" cols="12" class="pa-0 pb-5">
              <auto-complete-field
                ref="firstInput"
                v-model="newGlass[item]"
                v-bind="generalEyeData[item]"
              />
            </v-col>
            <v-col cols="12" md="6" class="px-1 pr-md-5 py-0">
              <single-eye-input
                v-bind="odEye"
                eye-name="OD"
                :add-enabled="newGlass?.glassesType === 'multifocal'"
                @update:model-value="
                  (e) => {
                    const index = e.id as keyof Eye
                    odEye[index] = e.value as number
                  }
                "
              />
            </v-col>
            <v-col cols="12" md="6" class="px-1 pl-md-5 py-0">
              <single-eye-input
                v-bind="osEye"
                eye-name="OS"
                :add-enabled="newGlass?.glassesType === 'multifocal'"
                @update:model-value="
                  (e) => {
                    const index = e.id as keyof Eye
                    updateSync(osEye, e.value as number)
                    osEye[index] = e.value as number
                  }
                "
              />
            </v-col>
            <v-col cols="12" class="px-0 pt-0">
              <div class="pb-3 text-body-2 text-medium-emphasis">
                You are in {{ reimsSiteName }} ({{ freeSlots }} SKUs left)
              </div>
              <div class="d-flex">
                <v-btn
                  v-prevent-enter-tab
                  :disabled="!valid || loading"
                  color="primary"
                  class="mr-4"
                  type="submit"
                  :loading="loading"
                  @click="submit"
                >
                  <span class="text-decoration-underline">A</span>
                  dd glasses
                </v-btn>
                <v-btn
                  v-prevent-enter-tab
                  class="mr-4"
                  variant="plain"
                  tabindex="-1"
                  @click="reset"
                >
                  Clear form
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
      <v-col
        v-if="lastAdded != null && lastAdded.length > 0"
        ref="results"
        cols="12"
        md="4"
        lg="3"
        class="pl-md-6 pt-3 pt-md-2"
      >
        <div class="text-h6 pb-2">Recently added</div>
        <div
          v-for="(item, idx) in lastAdded.slice(0, 3)"
          :key="item.id"
          :style="'opacity: ' + (1 - idx * 0.2)"
        >
          <glass-card :model-value="item" editable>
            <template #actions>
              <delete-button
                :glass="item"
                fixed-reason="WRONGLY_ADDED"
                @delete="submitDeletion(item.sku)"
              />
            </template>
          </glass-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { sanitizeEyeValues, clearObjectProperties, generalEyeData } from '@/lib/util'

import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'
import { useEnterToTab } from '@/lib/enter-to-tab'

import AutoCompleteField from '@/components/AutoCompleteField.vue'
import SingleEyeInput from '@/components/SingleEyeInput.vue'
import {
  Glasses,
  Eye,
  GlassesInput,
  OptionalEye,
  generalGlassesDataKeys,
} from '@/model/GlassesModel'

import { useDisplay } from 'vuetify'
import { useToast } from 'vue-toastification'

const GlassCard = defineAsyncComponent(() => import('@/components/GlassCard.vue'))
const DeleteButton = defineAsyncComponent(() => import('@/components/DeleteButton.vue'))

const toast = useToast()

const { mobile } = useDisplay()

const glassesStore = useGlassesStore()
const rootStore = useRootStore()
const allGlasses = computed(() => glassesStore.allGlasses)
const reimsSiteName = computed(() => rootStore.reimsSiteName)

const valid = ref(false)
const loading = ref(false)
const newGlass = ref<Partial<GlassesInput>>({})
const odEye = ref<OptionalEye>({ axis: '', cylinder: '', sphere: '', add: '' })
const osEye = ref<OptionalEye>({ axis: '', cylinder: '', sphere: '', add: '' })
const syncEyes = ref(true)
const results = ref<ComponentPublicInstance | null>(null)
const form = ref<HTMLFormElement | null>(null)
const firstInput = ref<ComponentPublicInstance[] | null>(null)

const lastAdded = computed(() => {
  return rootStore.lastAddedSkus
    .map((sku) => allGlasses.value.find((g) => g.sku === sku))
    .filter((itm) => itm != null) as Glasses[]
})
const freeSlots = computed(() => 5000 - allGlasses.value.length)

const { vPreventEnterTab } = useEnterToTab(form)

watch(
  () => odEye.value.add,
  (newVal) => {
    // set using vue function to trigger reactive system in SingleEyeInput
    if (syncEyes.value) osEye.value.add = newVal
  },
)

watch(allGlasses, () => {
  // Filter out deleted glasses
  rootStore.lastAddedSkus = rootStore.lastAddedSkus.filter((sku) =>
    allGlasses.value.find((g) => g.sku === sku),
  )
})

async function submit() {
  if (!valid.value) return
  loading.value = true
  newGlass.value.od = sanitizeEyeValues(odEye.value)
  newGlass.value.os = sanitizeEyeValues(osEye.value)
  if (newGlass.value.glassesType === undefined) throw new Error("glassesType can't be null")
  if (newGlass.value.appearance === undefined) throw new Error("appearance can't be null")
  if (newGlass.value.glassesSize === undefined) throw new Error("glassesSize can't be null")

  try {
    const newGlasses = await glassesStore.addGlasses(newGlass.value as GlassesInput)
    rootStore.lastAddedSkus.unshift(newGlasses.sku)
  } catch (error) {
    loading.value = false
    if (error.status === 409) {
      // no free skus left.
      toast.error(error.message)
    } else {
      toast.error(`Could not add glasses, please retry (${error.status})`)
    }
    return
  }
  loading.value = false
  reset()
  // scroll to bottom on mobile
  await nextTick()
  if (mobile.value) results.value?.$el.scrollIntoView(true)
}
function reset() {
  clearObjectProperties(odEye.value)
  clearObjectProperties(osEye.value)
  newGlass.value = {
    od: { sphere: '', cylinder: '', axis: '', add: '' },
    os: { sphere: '', cylinder: '', axis: '', add: '' },
  }
  form.value?.reset()
  if (!mobile.value && firstInput.value && firstInput.value.length) {
    firstInput.value[0].$el.focus()
  }
  syncEyes.value = true
}
function updateSync(oldEye: OptionalEye, newValue: number) {
  if (oldEye.add !== newValue) syncEyes.value = false
}
async function submitDeletion(sku: number) {
  try {
    await glassesStore.dispense(sku, 'WRONGLY_ADDED')
  } catch (error) {
    if (error.status === 404) {
      console.log('Already deleted')
    } else {
      toast.error(`Could not delete glasses, please retry (Error ${error.status})`)
    }
  }
}
</script>
