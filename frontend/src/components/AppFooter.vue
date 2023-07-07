<template>
  <v-footer
    app
    dark
    color="primary"
    elevation=4
    class="justify-center text-body-2 pa-1"
    padless
  >
    <div v-if="showLastUpdate" class="d-flex">
      <last-refresh-span /><span class="px-2">—</span>
      {{ allGlasses.length }} glasses stored<span class="px-2">—</span>
    </div>
    <span>&copy;
      <a
        href="https://partnersforvisualhealth.org/"
        tabindex="-1"
        target=”_blank”
        rel=noopener
        class="white--text"
      >Partners for Visual Health</a>
    </span>
  </v-footer>
</template>

<script setup lang="ts">
import LastRefreshSpan from '@/components/LastRefreshSpan.vue'
import { useRootStore } from '@/stores/root'
import { computed } from 'vue'
defineProps({
  showLastUpdate: {
    type: Boolean,
    default: true
  }

})

const rootStore = useRootStore()
const allGlasses = computed(() => rootStore.allGlasses)
</script>
