<template>
  <v-container class="px-1 px-lg-10" fluid>
    <v-row dense class="d-flex justify-center">
      <v-col cols=12>
        <v-alert type="warning" style="width: fit-content;">
          Filtering is not yet working
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
