<template>
  <v-container class="px-1 px-lg-10" fluid>
    <v-row dense class="d-flex justify-center">
      <v-col cols=12>
        <v-alert type="warning" style="width: fit-content;">
          Filtering is currently not working and sorting only for a few fields
        </v-alert>
        <glasses-table />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  title: 'View all data'
}
</script>
