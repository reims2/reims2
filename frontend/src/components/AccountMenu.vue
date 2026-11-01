<template>
  <v-menu :location="stacked ? 'end bottom' : 'bottom end'">
    <template #activator="{ props }">
      <v-btn
        v-if="stacked"
        v-bind="props"
        stacked
        variant="text"
        color="on-rail"
        class="text-body-small"
        :height="56"
        :width="96"
        :prepend-icon="mdiAccountCircleOutline"
        aria-label="Account"
      >
        Account
      </v-btn>
      <v-btn v-else v-bind="props" :icon="mdiAccountCircle" aria-label="Account" class="mr-1" />
    </template>
    <v-list min-width="220">
      <div class="px-3 pt-1 pb-3 text-body-small text-medium-emphasis">
        Logged in as {{ authStore.user }}
      </div>
      <v-divider class="mb-2 mx-n2" />
      <v-list-item
        title="About REIMS2"
        :prepend-icon="mdiInformationOutline"
        @click="isAboutDialogOpen = true"
      />
      <v-list-item title="Logout" :prepend-icon="mdiLogout" @click="authStore.logout()" />
    </v-list>
  </v-menu>
  <about-dialog v-model="isAboutDialogOpen" />
</template>

<script setup lang="ts">
import {
  mdiAccountCircle,
  mdiAccountCircleOutline,
  mdiInformationOutline,
  mdiLogout,
} from '@mdi/js'
import { useAuthStore } from '@/stores/auth'
import AboutDialog from '@/components/AboutDialog.vue'

const { stacked = false } = defineProps<{ stacked?: boolean }>()

const authStore = useAuthStore()
const isAboutDialogOpen = ref(false)
</script>
