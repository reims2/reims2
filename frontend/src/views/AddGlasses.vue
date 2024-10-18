<template>
  <v-container @keyup.a="submit">
    <v-row class="justify-center" dense>
      <v-col cols="12" md="6" lg="4" class="pb-2 px-2 pt-4">
        <v-form ref="form" v-model="valid" @submit.prevent>
          <v-row dense>
            <glass-input ref="inputComponent" v-model="glasses"></glass-input>
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
        aria-role="region"
        aria-labelledby="heading-recently-added"
      >
        <div id="heading-recently-added" class="text-h6 pb-2">Recently added</div>
        <div
          v-for="(item, idx) in lastAdded.slice(0, 3)"
          :key="item.id"
          :style="'opacity: ' + (1 - idx * 0.2)"
          :data-testid="'result-' + idx"
        >
          <glass-card :model-value="item" editable>
            <template #actions>
              <delete-button
                :glass="item"
                fixed-reason="WRONGLY_ADDED"
                @delete="submitDeletion(item)"
              />
            </template>
          </glass-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import GlassInput from '@/components/GlassInput.vue'
import { useRootStore } from '@/stores/root'
import { useEnterToTab } from 'vue3-enter-to-tab'

import { Glasses, GlassesInput as GlassesInputType } from '@/model/GlassesModel'

import { useDisplay } from 'vuetify'
import { useAddGlasses } from '@/composables/add'
import { useDeleteGlasses } from '@/composables/edit'

const GlassCard = defineAsyncComponent(() => import('@/components/GlassCard.vue'))
const DeleteButton = defineAsyncComponent(() => import('@/components/DeleteButton.vue'))

const { mobile } = useDisplay()

const rootStore = useRootStore()
const reimsSiteName = computed(() => rootStore.reimsSiteName)

const valid = ref(false)
const results = useTemplateRef('results')
const form = useTemplateRef('form')
const inputComponent = useTemplateRef('inputComponent')

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

async function submit() {
  if (!valid.value) return
  submitAdd()
}
async function onSuccess() {
  reset()
  // scroll to bottom on mobile
  await nextTick()
  if (mobile.value) results.value?.$el.scrollIntoView(true)
}
async function submitDeletion(glasses: Glasses) {
  const { deleteGlasses } = useDeleteGlasses(glasses.sku)
  await deleteGlasses('WRONGLY_ADDED')
}

function reset() {
  resetAdd()
  form.value?.reset()
  if (!mobile.value) inputComponent.value?.focus()
  inputComponent.value?.reset()
}
</script>
