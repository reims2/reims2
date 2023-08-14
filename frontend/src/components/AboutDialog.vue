<template>
  <v-dialog v-model="dialog" width="500">
    <v-card>
      <v-toolbar color="primary" title="About REIMS2"></v-toolbar>
      <v-card-text>
        <div>
          REIMS2 is the next version of the Richmond Eyeglass Inventory Matching System. It supports
          the annual visual health campaigns run by
          <a href="https://partnersforvisualhealth.org/" target="_blank" rel="noopener">
            Partners for Visual Health.
          </a>
        </div>

        <div class="pt-2">
          It is written using
          <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue.js 3</a>
          and
          <a href="https://vuetifyjs.com/" target="_blank" rel="noopener">Vuetify</a>
          .
        </div>

        <div class="pt-2 text-medium-emphasis">
          Version:
          <a :href="commitUrl" target="_blank" rel="noopener" style="text-decoration: none">
            <code>{{ rootStore.version || 'unknown' }}</code>
          </a>
          <br />
          Glasses stored: {{ glassesCount }}
          <br />
          Last update: {{ lastRefresh }}
          <br />
          Offline support: {{ offlineReady ? 'enabled' : 'not available' }}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn href="/docs/" target="_blank" variant="text">View documentation</v-btn>
        <v-btn variant="text" @click="dialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { useRootStore } from '@/stores/root'
import { useGlassesStore } from '@/stores/glasses'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import dayjs from 'dayjs'

const rootStore = useRootStore()
const glassesStore = useGlassesStore()

const props = defineProps<{ modelValue: boolean }>()

const emit = defineEmits(['update:modelValue'])
const dialog = useVModel(props, 'modelValue', emit)

const { offlineReady } = useRegisterSW()

const glassesCount = computed(() => glassesStore.allGlasses.length)
const commitUrl = computed(() => {
  return rootStore.version
    ? 'https://github.com/reims2/reims2-frontend/commit/' + rootStore.version
    : undefined
})
const lastRefresh = computed(() => {
  return dayjs(glassesStore.lastRefresh).format('YYYY-MM-DD HH:mm:ss')
})
</script>
