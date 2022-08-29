<template>
  <v-dialog
    :value="value"
    max-width="600px"
    @input="e => updateDialogState(e)"
  >
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
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
          Save
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
      this.$store.commit('setLocation', this.newLocation)
      await this.$store.dispatch('loadGlasses')
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
