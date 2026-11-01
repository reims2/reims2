<template>
  <v-bottom-navigation color="primary" grow>
    <v-btn v-for="item in items" :key="item.to" :to="item.to" :disabled="item.disabled || false">
      <v-icon size="large" :icon="$route.path === item.to ? item.activeIcon : item.icon" />
      <span>{{ item.title }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { NavItem } from '@/model/ReimsModel'

defineProps<{
  items: NavItem[]
}>()
</script>
