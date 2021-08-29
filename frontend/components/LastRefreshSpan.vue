<template>
  <span>Last update {{ lastRefreshString }}</span>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      lastRefreshString: null,
      refreshInterval: ''
    }
  },
  computed: {
    ...mapState([
      'lastRefresh'
    ])
  },
  watch: {
    lastRefresh() {
      if (this.lastRefresh) this.generateTimeString()
    }
  },
  created() {
    this.refreshInterval = setInterval(() => this.generateTimeString(), 10 * 1000)
    this.generateTimeString()
  },
  beforeDestroy() {
    clearInterval(this.refreshInterval)
  },
  methods: {
    generateTimeString() {
      this.lastRefreshString = this.$dayjs().to(this.lastRefresh)
    }
  }

}
</script>
