<template>
  <v-container @keyup.a="submit">
    <v-row class="justify-center" dense>
      <v-col cols="12" md="6" lg="4" class="pb-2 px-2 pt-4">
        <v-form ref="form" v-model="valid" @submit.prevent>
          <v-row dense>
            <v-col v-for="item in generalEyeData" :key="item.label" cols="12" class="pa-0 pb-5">
              <auto-complete-field ref="firstInput" v-model="glassModel[item.id]" v-bind="item" />
            </v-col>
            <v-col cols="12" md="6" class="px-1 pr-md-5 py-0">
              <single-eye-input
                v-bind="odEye"
                eye-name="OD"
                :add-enabled="glassModel?.glassesType === 'multifocal'"
                @update:modelValue="
                  (e) => {
                    odEye[e.id] = e.value
                  }
                "
              />
            </v-col>
            <v-col cols="12" md="6" class="px-1 pl-md-5 py-0">
              <single-eye-input
                v-bind="osEye"
                eye-name="OS"
                :add-enabled="glassModel?.glassesType === 'multifocal'"
                @update:modelValue="
                  (e) => {
                    updateSync(osEye, e.value)
                    osEye[e.id] = e.value
                  }
                "
              />
            </v-col>
            <v-col cols="12" class="px-0 pt-0">
              <div class="pb-3 text-body-2 text--secondary">
                You are in {{ locationNames[reimsSite] }} ({{ freeSlots }} SKUs left)
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
                <v-btn v-prevent-enter-tab class="mr-4" plain tabindex="-1" @click="reset">
                  Clear form
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
      <v-col
        v-if="lastAdded.length > 0"
        ref="results"
        cols="12"
        md="4"
        lg="3"
        class="pl-md-6 pt-3 pt-md-2"
      >
        <div class="text-h6 pb-2">Recently added</div>
        <glass-card
          v-for="(item, idx) in lastAdded.slice(0, 3)"
          :key="item.id"
          :glass="item"
          :style="'opacity: ' + (1 - idx * 0.3)"
          editable
        >
          <template #actions>
            <delete-button
              :glass="item"
              fixed-reason="WRONGLY_ADDED"
              @delete="submitDeletion(item.sku)"
            />
          </template>
        </glass-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import {
  generalEyeData,
  sanitizeEyeValues,
  clearObjectProperties,
  reimsSiteNames as locationNames,
} from '@/lib/util'
// TODO import { ModifiedEnterToTabMixin } from '@/plugins/vue-enter-to-tab'
import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'
import { ref, computed, watch, nextTick } from 'vue'

import AutoCompleteField from '@/components/AutoCompleteField.vue'
import SingleEyeInput from '@/components/SingleEyeInput.vue'
import GlassCard from '@/components/GlassCard.vue'
import DeleteButton from '@/components/DeleteButton.vue'
import { Eye, Glasses } from '@/model/GlassesModel'

const glassesStore = useGlassesStore()
const rootStore = useRootStore()
const reimsSite = computed(() => rootStore.reimsSite)
const valid = ref(false)
const loading = ref(false)
const glassModel = ref<Glasses | null>(null)
const odEye = ref({ axis: '', cylinder: '', sphere: '', add: '' })
const osEye = ref({ axis: '', cylinder: '', sphere: '', add: '' })
const syncEyes = ref(true)
const output = ref('')
const lastAddedSkus = ref([])
const eyes = ref([
  {
    text: 'OD',
    key: 'od',
  },
  {
    text: 'OS',
    key: 'os',
  },
])
const results = ref<HTMLElement | null>(null)
const form = ref<HTMLFormElement | null>(null)
const firstInput = ref<HTMLElement[] | null>(null)

const lastAdded = computed(() =>
  lastAddedSkus.value.map((sku) => rootStore.allGlasses.find((g) => g.sku === sku)),
)
const freeSlots = computed(() => 5000 - rootStore.allGlasses.length)

watch(
  () => odEye.value.add,
  (newVal) => {
    // set using vue function to trigger reactive system in SingleEyeInput
    if (syncEyes) osEye.value.add = newVal
  },
)

watch(
  () => rootStore.allGlasses,
  () => {
    lastAddedSkus.value = lastAddedSkus.value.filter((sku) =>
      rootStore.allGlasses.find((g) => g.sku === sku),
    )
  },
)
async function submit() {
  if (!valid.value) return
  loading.value = true
  glassModel.value.od = sanitizeEyeValues(odEye.value)
  glassModel.value.os = sanitizeEyeValues(osEye.value)

  try {
    const newGlasses = await glassesStore.addGlasses(glassModel.value)
    lastAddedSkus.value = lastAddedSkus.value.filter((sku) => sku !== newGlasses.sku)
  } catch (error) {
    loading.value = false
    if (error.status === 409) {
      // no free skus left.
      rootStore.setError(error.message)
    } else {
      rootStore.setError(`Could not add glasses, please retry (${error.status})`)
    }
    return
  }
  loading.value = false
  rootStore.clearError()
  reset()
  // scroll to bottom on mobile
  nextTick(() => {
    if (rootStore.isMobile) results.value?.scrollIntoView(true)
  })
}
function reset() {
  clearObjectProperties(odEye.value)
  clearObjectProperties(osEye.value)
  glassModel.value = { od: null, os: null }
  form.value?.reset()
  if (!rootStore.isMobile && firstInput.value) firstInput.value[0].focus()
  syncEyes.value = true
}
function updateSync(oldEye: Eye, newValue: number) {
  if (oldEye.add !== newValue) syncEyes.value = false
}
async function submitDeletion(sku: number) {
  try {
    await glassesStore.dispense(sku, 'WRONGLY_ADDED')
  } catch (error) {
    if (error.status === 404) {
      console.log('Already deleted')
    } else {
      rootStore.setError(`Could not delete glasses, please retry (Error ${error.status})`)
    }
  }
}
</script>
