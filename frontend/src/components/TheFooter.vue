<template>
  <v-footer app color="surface-muted" border="t" class="justify-center text-body-medium pa-1">
    <div v-if="showLastUpdate" class="d-flex">
      <last-refresh-span />
      <span class="px-2">—</span>
    </div>
    <span>
      &copy;
      <a
        href="https://partnersforvisualhealth.org/"
        tabindex="-1"
        target="_blank"
        rel="noopener"
        class="text-primary"
      >
        Partners for Visual Health
      </a>
    </span>
  </v-footer>
</template>

<script setup lang="ts">
import LastRefreshSpan from '@/components/LastRefreshSpan.vue'

defineProps<{ showLastUpdate: boolean }>()
</script>
