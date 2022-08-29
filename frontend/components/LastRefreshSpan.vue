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
    ...mapState(['lastRefresh'])
  },
  watch: {
    lastRefresh() {
      this.generateTimeString()
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
      if (!this.lastRefresh) {
        this.lastRefreshString = ': none yet'
      } else if (this.$dayjs().diff(this.lastRefresh) < 5 * 60 * 1000) {
        this.lastRefreshString = 'now' // don't bother the user with anything less than 5 minutes
      } else {
        this.lastRefreshString = this.$dayjs().to(this.lastRefresh)
      }
    }
  }

}
</script>
