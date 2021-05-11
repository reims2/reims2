<template>
  <v-container class="px-1 px-lg-10" fluid>
    <v-row dense class="d-flex justify-center">
      <v-col cols=12>
        <glasses-table
          v-col
          :glasses="glasses"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  title: 'View all data',
  computed: {
    ...mapState({
      glasses: state => state.glasses.glasses
    })
  },
  mounted() {
    this.load()
  },
  methods: {
    ...mapActions({
      load: 'glasses/loadActiveGlasses'
    })
  }
}
</script>
