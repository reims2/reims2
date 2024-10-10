<template>
  <v-container @keyup.s="submitAndUpdate">
    <v-row dense class="justify-center">
      <v-col cols="12" md="6" lg="5" class="px-3">
        <v-form ref="form" v-model="valid" @submit.prevent>
          <v-row dense>
            <glass-input v-model="glasses" :bal-enabled="true" :only-category="true"></glass-input>
            <v-col cols="12" class="pa-0">
              <v-checkbox
                v-model="highTolerance"
                default-value="false"
                label="Increase search tolerance (might yield bad results)"
                tabindex="-1"
              />
            </v-col>
            <v-col cols="12" class="px-0">
              <div>
                <v-btn
                  v-prevent-enter-tab
                  :disabled="Boolean(searchButtonDisabled)"
                  color="primary"
                  class="mr-4"
                  type="submit"
                  @click="submitAndUpdate"
                >
                  <span class="text-decoration-underline">S</span>
                  earch glasses
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
        ref="results"
        data-testid="results"
        cols="12"
        md="6"
        lg="5"
        xl="3"
        class="pt-10 pt-md-1 px-0 pl-md-6"
      >
        <v-alert v-if="matches == null" type="info" color="primary" density="comfortable">
          Start a new search to display results
        </v-alert>
        <v-alert v-else-if="matches.length === 0" type="warning" density="comfortable">
          No suitable glasses found. Please try another search.
        </v-alert>
        <div v-else>
          <div v-for="item in paginatedMatches" :key="item.id">
            <glass-card :model-value="item">
              <template #actions>
                <v-btn
                  :to="{ path: '/edit', query: { sku: item.sku } }"
                  variant="text"
                  class="mx-0"
                  color="primary"
                >
                  Open Glasses
                </v-btn>
              </template>
            </glass-card>
          </div>
          <div class="text-center">
            <v-pagination v-model="page" :length="pageCount" rounded="circle" />
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useGlassesStore } from '@/stores/glasses'

import GlassInput from '@/components/GlassInput.vue'

import { GlassesInput as GlassesInputType } from '@/model/GlassesModel'
import { resetEyeInput } from '@/util/eye-utils'

import { useEnterToTab } from 'vue3-enter-to-tab'
import { useFindGlasses } from '@/composables/find'
import { useDisplay } from 'vuetify'

const GlassCard = defineAsyncComponent(() => import('@/components/GlassCard.vue'))

const { mobile } = useDisplay()

const glasses: Ref<GlassesInputType> = ref({
  glassesType: '',
  od: { sphere: '', cylinder: '', axis: '', add: '', isBAL: false },
  os: { sphere: '', cylinder: '', axis: '', add: '', isBAL: false },
  glassesSize: '',
  appearance: '',
})

const glassesStore = useGlassesStore()

const firstInput = ref<HTMLElement | null>(null)
const form = ref<HTMLFormElement | null>(null)
const results = ref<ComponentPublicInstance | null>(null)

const valid = ref(false)
const page = ref(1)

const highTolerance = ref(false)
const syncEye = ref(true)

const itemsPerPage = 3

const { matches, startSearch } = useFindGlasses(glasses, highTolerance, valid)

const searchButtonDisabled = computed(() => {
  return !valid.value && glassesStore.hasGlassesLoaded
})
const paginatedMatches = computed(() => {
  if (matches.value == null) return null
  return matches.value.slice(
    itemsPerPage * (page.value - 1),
    itemsPerPage * (page.value - 1) + itemsPerPage,
  )
})

const pageCount = computed(() => {
  if (!matches.value) return 0
  const pages = Math.ceil(matches.value.length / itemsPerPage)
  return pages > 10 ? 10 : pages
})

const { vPreventEnterTab } = useEnterToTab(form)

async function submitAndUpdate() {
  startSearch()

  // syncEye.value = true // fixme good hgere?
  page.value = 1
  // on desktop, focus input again; on mobile, scroll to bottom
  if (!mobile.value) firstInput.value?.focus()
  else results.value?.$el.scrollIntoView(true)
}

function reset() {
  resetEyeInput(glasses.value.od)
  resetEyeInput(glasses.value.os)
  form.value?.reset()
  syncEye.value = true
  if (!mobile.value) firstInput.value?.focus()
}
</script>
