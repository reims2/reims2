<template>
  <page-layout title="Add glasses" @keydown.a.exact.prevent="$event.repeat || add()">
    <template #chips>
      <v-chip variant="flat" color="primary-tonal" class="font-weight-bold text-tabular">
        {{ freeSlots.toLocaleString('en-US') }} free SKUs
      </v-chip>
    </template>
    <v-col cols="12" md="5">
      <v-form ref="form" v-model="valid" @submit.prevent>
        <page-card title="Glasses">
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
            ></glass-input>
          </div>
          <template #footer>
            <span class="text-body-medium text-medium-emphasis">
              Adds to
              <strong class="text-high-emphasis font-weight-semibold">{{ reimsSiteName }}</strong>
              with the next free SKU
            </span>
            <v-spacer />
            <v-btn
              v-prevent-enter-tab
              :disabled="loading"
              color="primary"
              size="large"
              variant="flat"
              elevation="2"
              type="submit"
              :loading="loading"
              :prepend-icon="mdiPlus"
              @click="add"
            >
              Add glasses
              <v-chip size="x-small" label variant="tonal" class="ml-3 font-weight-bold">A</v-chip>
            </v-btn>
          </template>
        </page-card>
      </v-form>
    </v-col>

    <v-col cols="12" md="7">
      <page-card ref="results" title="Recently added">
        <template #header>
          <span v-if="lastAdded.length" class="text-body-medium text-medium-emphasis">
            Last {{ Math.min(lastAdded.length, 3) }}, newest first
          </span>
        </template>
        <p v-if="lastAdded.length === 0" class="pa-6 ma-0 text-body-medium text-medium-emphasis">
          Glasses you add show up here with their new SKU.
        </p>
        <div v-else>
          <div
            v-for="(item, idx) in lastAdded.slice(0, 3)"
            :key="item.id"
            :data-testid="'result-' + idx"
          >
            <v-divider v-if="idx > 0" />
            <glasses-row :glasses="item" editable>
              <template #actions>
                <delete-button
                  :glass="item"
                  fixed-reason="WRONGLY_ADDED"
                  @delete="submitDeletion(item)"
                />
              </template>
            </glasses-row>
          </div>
        </div>
      </page-card>
    </v-col>
  </page-layout>
</template>

<script setup lang="ts">
import GlassInput from '@/components/GlassInput.vue'
import GlassesRow from '@/components/GlassesRow.vue'
import DeleteButton from '@/components/DeleteButton.vue'
import PageLayout from '@/components/PageLayout.vue'
import PageCard from '@/components/PageCard.vue'
import { mdiRestore, mdiPlus } from '@mdi/js'
import { useRootStore } from '@/stores/root'
import { useEnterToTab } from 'vue3-enter-to-tab'

import { Glasses, GlassesInput as GlassesInputType } from '@/model/GlassesModel'

import { useDisplay } from 'vuetify'
import { useAddGlasses } from '@/composables/add'
import { useDeleteGlasses } from '@/composables/edit'

const { mobile } = useDisplay()

const rootStore = useRootStore()
const reimsSiteName = computed(() => rootStore.reimsSiteName)

const valid = ref(false)
const results = useTemplateRef('results')
const form = useTemplateRef('form')
const inputComponent = useTemplateRef('inputComponent')

const syncEyeAdd = ref(true)
const glasses: Ref<GlassesInputType> = ref({
  glassesType: '',
  od: { sphere: '', cylinder: '', axis: '', add: '' },
  os: { sphere: '', cylinder: '', axis: '', add: '' },
  glassesSize: '',
  appearance: '',
})

const {
  loading,
  lastAdded,
  freeSlots,
  submit: submitAdd,
  reset: resetAdd,
} = useAddGlasses(glasses, onSuccess)

const { vPreventEnterTab } = useEnterToTab(form)

const glassesToDelete = ref<Glasses | null>(null)
const { deleteGlasses } = useDeleteGlasses(glassesToDelete)

function add() {
  if (valid.value) submitAdd()
  else form.value?.validate()
}
async function onSuccess() {
  reset()
  // scroll to bottom on mobile
  await nextTick()
  if (mobile.value) results.value?.$el.scrollIntoView(true)
}
async function submitDeletion(glasses: Glasses) {
  glassesToDelete.value = glasses
  await deleteGlasses('WRONGLY_ADDED')
}

function reset() {
  resetAdd()
  form.value?.reset()
  if (!mobile.value) inputComponent.value?.focus()
  syncEyeAdd.value = true
}
</script>
