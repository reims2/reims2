<template>
  <v-container class="px-2 px-md-10" fluid>
    <v-row dense class="d-flex justify-center">
      <v-col class="text-body-2 text--secondary pb-6">
        You can sort this table by clicking on the column names. Further features will follow.
      </v-col>
      <v-col cols=12>
        <v-data-table
          fixed-header
          :headers="headers"
          :items="glasses"
          :items-per-page="20"
          dense
          must-sort
          sort-by="sku"
          :footer-props="{
            showFirstLastPage: true,
            itemsPerPageOptions: [10,20,100,500],
            showCurrentPage: true
          }"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  title: 'View and analyse data',
  data: () => ({
    headers: [
      { value: 'sku', text: 'SKU' },
      { value: 'type', text: 'TYPE' },
      { value: 'odsphere', text: 'OD SPHERE' },
      { value: 'odcylinder', text: 'OD CYLINDER' },
      { value: 'odaxis', text: 'OD AXIS' },
      { value: 'odadd', text: 'OD ADD' },
      { value: 'ossphere', text: 'OS SPHERE' },
      { value: 'oscylinder', text: 'OS CYLINDER' },
      { value: 'osaxis', text: 'OS AXIS' },
      { value: 'osadd', text: 'OS ADD' },
      { value: 'appearance', text: 'APPEARANCE' },
      { value: 'size', text: 'SIZE' }
    ]
  }),
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
