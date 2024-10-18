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
          <a href="https://vuetifyjs.com/" target="_blank" rel="noopener">Vuetify.</a>
        </div>

        <div class="pt-2 text-medium-emphasis">
          Version:
          <a :href="commitUrl" target="_blank" rel="noopener" style="text-decoration: none">
            <code>{{ gitHash }}</code>
          </a>
          <br />
          Glasses stored: {{ glassesCount }}
          <br />
          Last update: {{ lastRefresh }}
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
import { useRootStore } from '@/stores/root'
import { useGlassesStore } from '@/stores/glasses'
import dayjs from 'dayjs'

const rootStore = useRootStore()
const glassesStore = useGlassesStore()

const dialog = defineModel<boolean>('modelValue', { required: true })

const glassesCount = computed(() => glassesStore.allGlasses.length)
const commitUrl = computed(() => {
  return rootStore.version
    ? 'https://github.com/reims2/reims2/commit/' + rootStore.version
    : undefined
})
const lastRefresh = computed(() => {
  if (!glassesStore.lastRefresh) return 'none yet'
  return dayjs(glassesStore.lastRefresh).format('YYYY-MM-DD HH:mm:ss')
})

const gitHash = computed(() => {
  if (!rootStore.version) return 'development'
  return rootStore.version.length > 7 ? rootStore.version.substring(0, 7) : rootStore.version
})
</script>
