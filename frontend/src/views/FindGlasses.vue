<template>
  <page-layout title="Find glasses" @keydown.s.exact.prevent="$event.repeat || search()">
    <v-col cols="12" md="5">
      <v-form ref="form" v-model="valid" @submit.prevent>
        <page-card title="Prescription">
          <template #header>
            <v-btn
              v-prevent-enter-tab
              variant="text"
              class="text-medium-emphasis"
              tabindex="-1"
              :prepend-icon="mdiRestore"
              @click="reset"
            >
              Clear form
            </v-btn>
          </template>
          <div class="pa-6">
            <glass-input
              ref="inputComponent"
              v-model="glasses"
              v-model:sync-eyes="syncEyeAdd"
              :glasses-type-only="true"
            ></glass-input>
          </div>
          <template #footer>
            <v-checkbox
              v-model="highTolerance"
              tabindex="-1"
              density="compact"
              hide-details
              class="flex-1-1 ml-n1"
            >
              <template #label>
                <span class="d-flex flex-column text-body-medium">
                  <span class="text-high-emphasis font-weight-medium">Wider tolerance</span>
                  <span class="text-body-small text-medium-emphasis">May give poor matches</span>
                </span>
              </template>
            </v-checkbox>
            <v-btn
              v-prevent-enter-tab
              color="primary"
              size="large"
              variant="flat"
              elevation="2"
              type="submit"
              :prepend-icon="mdiMagnify"
              @click="search"
            >
              Search glasses
              <v-chip size="x-small" label variant="tonal" class="ml-3 font-weight-bold">S</v-chip>
            </v-btn>
          </template>
        </page-card>
      </v-form>
    </v-col>

    <v-col cols="12" md="7">
      <page-card ref="results" title="Results">
        <template #header>
          <span v-if="matches?.length" class="text-body-medium text-medium-emphasis text-tabular">
            {{ matches.length }}
            {{ matches.length === 1 ? 'match' : 'matches, best first (lower score is closer)' }}
          </span>
          <span v-else-if="matches" class="text-body-medium text-medium-emphasis">No matches</span>
        </template>

        <v-empty-state
          v-if="matches == null"
          :icon="mdiMagnify"
          title="Search to see matches"
          class="py-12"
        />
        <v-empty-state
          v-else-if="matches.length === 0"
          :icon="mdiMagnifyRemoveOutline"
          title="No close matches in stock"
          :text="
            (highTolerance
              ? 'Check the input, then try a BAL lens.'
              : 'Check the input, then try wider tolerance or a BAL lens.') +
            ' Failed searches are logged to plan future stock.'
          "
          text-width="320"
          class="py-12"
        />

        <template v-else>
          <div
            v-for="(item, idx) in paginatedMatches"
            :key="item.id"
            :data-testid="'result-' + idx"
          >
            <v-divider v-if="idx > 0" />
            <glasses-row :glasses="item">
              <template #actions>
                <v-btn
                  v-if="item.dispensed"
                  variant="text"
                  color="primary"
                  :loading="isLoading && current?.id === item.id"
                  @click="undo(item)"
                >
                  Undo
                </v-btn>
                <template v-else>
                  <v-btn
                    :to="{ path: '/edit', query: { sku: item.sku } }"
                    variant="text"
                    color="primary"
                  >
                    Open
                  </v-btn>
                  <v-btn
                    variant="flat"
                    color="primary"
                    min-width="100"
                    :loading="isLoading && current?.id === item.id"
                    @click="dispense(item)"
                  >
                    Dispense
                  </v-btn>
                </template>
              </template>
            </glasses-row>
          </div>
          <nav v-if="pageCount > 1" aria-label="Result pages" class="border-t pa-1">
            <v-pagination
              v-model="page"
              :length="pageCount"
              rounded="circle"
              density="comfortable"
              active-color="primary"
            />
          </nav>
        </template>
      </page-card>
    </v-col>
  </page-layout>
</template>

<script setup lang="ts">
import { mdiRestore, mdiMagnify, mdiMagnifyRemoveOutline } from '@mdi/js'

import GlassInput from '@/components/GlassInput.vue'
import GlassesRow from '@/components/GlassesRow.vue'
import PageLayout from '@/components/PageLayout.vue'
import PageCard from '@/components/PageCard.vue'

import { GlassesInput as GlassesInputType } from '@/model/GlassesModel'
import { resetEyeInput } from '@/util/eye-utils'

import { useEnterToTab } from 'vue3-enter-to-tab'
import { useDispenseResult, useFindGlasses } from '@/composables/find'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()

const glasses: Ref<GlassesInputType> = ref({
  glassesType: '',
  od: { sphere: '', cylinder: '', axis: '', add: '', isBAL: false },
  os: { sphere: '', cylinder: '', axis: '', add: '', isBAL: false },
})

const inputComponent = useTemplateRef('inputComponent')
const form = useTemplateRef('form')
const results = useTemplateRef('results')

const valid = ref(false)
const page = ref(1)
const syncEyeAdd = ref(true)

const highTolerance = ref(false)

const itemsPerPage = 5

const { matches, startSearch } = useFindGlasses(glasses, highTolerance, valid)
const { shown, dispense, undo, isLoading, current } = useDispenseResult(matches)

const paginatedMatches = computed(() => {
  if (matches.value == null) return null
  return matches.value
    .slice(itemsPerPage * (page.value - 1), itemsPerPage * (page.value - 1) + itemsPerPage)
    .map(shown)
})

const pageCount = computed(() => {
  if (!matches.value) return 0
  const pages = Math.ceil(matches.value.length / itemsPerPage)
  return pages > 10 ? 10 : pages
})

const { vPreventEnterTab } = useEnterToTab(form)

// an enabled button that shows the missing fields beats a greyed out one
function search() {
  if (valid.value) submitAndUpdate()
  else form.value?.validate()
}

async function submitAndUpdate() {
  // refocus first, the blur can reformat a field and that clears any matches found before it
  if (!mobile.value) inputComponent.value?.focus()
  await nextTick()
  startSearch()

  page.value = 1
  if (mobile.value) results.value?.$el.scrollIntoView(true)
}

function reset() {
  resetEyeInput(glasses.value.od)
  resetEyeInput(glasses.value.os)
  form.value?.reset()
  if (!mobile.value) inputComponent.value?.focus()
  syncEyeAdd.value = true
}
</script>
