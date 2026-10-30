<template>
  <v-navigation-drawer :rail="!rootStore.drawer" permanent>
    <v-list nav color="primary" class="mt-2">
      <v-list-item
        v-for="item in items"
        :key="item.title"
        :to="item.to"
        :disabled="item.disabled || false"
        :title="item.title"
        :prepend-icon="item.icon"
        class="nav-item"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useRootStore } from '@/stores/root'
import { DrawerItem } from '@/model/ReimsModel'

defineProps<{
  items: DrawerItem[]
}>()

const rootStore = useRootStore()
</script>

<style scoped>
.nav-item :deep(.v-list-item-title) {
  font-size: 1rem;
}
</style>
