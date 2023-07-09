<template>
  <div class="d-flex align-center">
    <v-progress-circular
      :style="{ visibility: isRefreshingGlasses ? 'visible' : 'hidden' }"
      indeterminate
      size="17"
      color="white"
      class="mr-2 ma-0 pa-0"
    />
    Last update {{ lastRefreshString }}
  </div>
</template>

<script>
import { useRootStore } from '@/stores/root'

export default {
  inject: ['dayjs'],
  setup() {
    const rootStore = useRootStore()
    return {
      lastRefresh: rootStore.lastRefresh,
      isRefreshingGlasses: rootStore.isRefreshingGlasses,
    }
  },
  data() {
    return {
      lastRefreshString: null,
      refreshInterval: '',
    }
  },
  watch: {
    lastRefresh() {
      this.generateTimeString()
    },
  },
  created() {
    this.refreshInterval = setInterval(() => this.generateTimeString(), 10 * 1000)
    this.generateTimeString()
  },
  beforeUnmount() {
    clearInterval(this.refreshInterval)
  },
  methods: {
    generateTimeString() {
      if (!this.lastRefresh) {
        this.lastRefreshString = ': none yet'
      } else if (this.dayjs().diff(this.lastRefresh) < 5 * 60 * 1000) {
        this.lastRefreshString = 'now' // don't bother the user with anything less than 5 minutes
      } else {
        this.lastRefreshString = this.dayjs().to(this.lastRefresh)
      }
    },
  },
}
</script>
