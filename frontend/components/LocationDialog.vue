<template>
  <v-dialog
    :value="value"
    max-width="400px"
    persistent
    @input="e => updateDialogState(e)"
  >
    <v-card>
      <v-card-title class="text-h5 secondary white--text">
        Change location
      </v-card-title>

      <v-card-text>
        <v-select
          v-model="newLocation"
          :items="locations"
          class="mt-5"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn

          text
          @click="updateDialogState(false)"
        >
          Close
        </v-btn>
        <v-btn
          color="primary"
          text
          :loading="loading"
          :disabled="newLocation == location"
          @click="changeLocation"
        >
          Apply
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
    value: {
      type: Boolean,
      required: true

    }
  },
  data() {
    return {
      loading: false,
      newLocation: '',
      locations: [
        { text: 'San Miguel', value: 'sm' },
        { text: 'Santa Ana', value: 'sa' }
      ]
    }
  },
  computed: {
    ...mapState(['location'])
  },
  mounted() {
    this.newLocation = this.location
  },
  methods: {
    async changeLocation() {
      this.loading = true
      this.prevLocation = this.location
      this.$store.commit('setLocation', this.newLocation)

      try {
        await this.$store.dispatch('loadGlasses')
      } catch (error) {
        // reset location
        this.newLocation = this.prevLocation
        this.$store.commit('setLocation', this.newLocation)

        this.$store.commit('setError', `Cannot change location (Error ${error.status})`)
      }

      this.loading = false
      this.updateDialogState(false)
    },
    updateDialogState(value) {
      this.$emit('input', value)
      this.newLocation = this.location
    }
  }
}
</script>
