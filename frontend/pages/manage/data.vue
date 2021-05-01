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
import { mapState } from 'vuex'
export default {
  title: 'View and analyse data',
  data: () => ({
    // headers: ['SKU', 'TYPE', 'ODSPHERE', 'ODCYLINDER', 'ODAXIS', 'ODADD', 'OSSPHERE', 'OSCYLINDER', 'OSAXIS', 'OSADD', 'GENDER', 'MATERIAL', 'SIZE']
    headers: [
      { value: 'SKU', text: 'SKU' },
      { value: 'TYPE', text: 'TYPE' },
      { value: 'ODSPHERE', text: 'OD SPHERE' },
      { value: 'ODCYLINDER', text: 'OD CYLINDER' },
      { value: 'ODAXIS', text: 'OD AXIS' },
      { value: 'ODADD', text: 'OD ADD' },
      { value: 'OSSPHERE', text: 'OS SPHERE' },
      { value: 'OSCYLINDER', text: 'OS CYLINDER' },
      { value: 'OSAXIS', text: 'OS AXIS' },
      { value: 'OSADD', text: 'OS ADD' },
      { value: 'GENDER', text: 'GENDER' },
      { value: 'MATERIAL', text: 'MATERIAL' },
      { value: 'SIZE', text: 'SIZE' }
    ]
  }),
  computed: {
    ...mapState({
      glasses: state => state.glasses.glasses
    })
  }
}
</script>
