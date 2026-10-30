<template>
  <v-menu location="bottom start">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="tonal"
        class="ml-2 ml-sm-0 text-none"
        :prepend-icon="mdiMapMarker"
        :append-icon="mdiMenuDown"
        :disabled="!isOnline || switchingTo !== null"
        :aria-label="`Change location (${rootStore.reimsSiteName})`"
      >
        {{ rootStore.reimsSiteName }}
      </v-btn>
    </template>
    <v-list density="comfortable" min-width="200">
      <v-list-item
        v-for="site in reimsSiteSelects"
        :key="site.value"
        :title="site.title"
        :active="site.value === rootStore.reimsSite"
        color="primary"
        @click="changeLocation(site.value)"
      >
        <template #append>
          <v-icon v-if="site.value === rootStore.reimsSite" :icon="mdiCheck" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
  <!-- blocks the page until the new site's glasses are loaded, searches would use the old ones -->
  <v-overlay
    :model-value="switchingTo !== null"
    persistent
    class="d-flex justify-center align-center"
  >
    <v-sheet class="pa-10" rounded>
      <v-progress-linear indeterminate color="primary" class="mb-5" aria-label="Switching" />
      <div class="text-medium-emphasis">Switching to {{ switchingTo }}...</div>
    </v-sheet>
  </v-overlay>
</template>

<script setup lang="ts">
import { mdiCheck, mdiMapMarker, mdiMenuDown } from '@mdi/js'
import { useOnline } from '@vueuse/core'
import { ReimsSite } from '@/model/ReimsModel'
import { useRootStore } from '@/stores/root'
import { useGlassesStore } from '@/stores/glasses'
import { useToast } from '@/composables/toast'
import { reimsSiteMap, reimsSiteSelects } from '@/util/util'

const toast = useToast()
const rootStore = useRootStore()
const glassesStore = useGlassesStore()
const isOnline = useOnline()
const switchingTo = ref<string | null>(null)

async function changeLocation(newLocation: ReimsSite) {
  if (newLocation === rootStore.reimsSite) return
  const prevLocation = rootStore.reimsSite
  switchingTo.value = reimsSiteMap[newLocation]
  rootStore.reimsSite = newLocation
  try {
    await glassesStore.loadGlasses()
    toast.info(`Now using ${reimsSiteMap[newLocation]}`)
  } catch (error) {
    rootStore.reimsSite = prevLocation
    toast.error(`Cannot change location (${(error as Error).message})`)
  } finally {
    switchingTo.value = null
  }
}
</script>
