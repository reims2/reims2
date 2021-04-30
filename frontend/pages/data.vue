<template>
  <v-container class="mx-10">
    <v-row>
      <v-col class="text-center">
        <v-data-table
          :headers="headers"
          :items="glasses"
          :items-per-page="20"
          dense
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
export default {
  title: 'View and analyse data',
  data: () => ({
    // headers: ['SKU', 'TYPE', 'ODSPHERE', 'ODCYLINDER', 'ODAXIS', 'ODADD', 'OSSPHERE', 'OSCYLINDER', 'OSAXIS', 'OSADD', 'GENDER', 'MATERIAL', 'SIZE']
    headers: [
      { value: 'SKU', text: 'SKU' },
      { value: 'TYPE', text: 'TYPE' },
      { value: 'ODSPHERE', text: 'ODSPHERE' },
      { value: 'ODCYLINDER', text: 'ODCYLINDER' },
      { value: 'ODAXIS', text: 'ODAXIS' },
      { value: 'ODADD', text: 'ODADD' },
      { value: 'OSSPHERE', text: 'OSSPHERE' },
      { value: 'OSCYLINDER', text: 'OSCYLINDER' },
      { value: 'OSAXIS', text: 'OSAXIS' },
      { value: 'OSADD', text: 'OSADD' },
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
