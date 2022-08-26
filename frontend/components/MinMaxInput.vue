<template>
  <div class="d-flex align-end fill-height pb-1">
    <v-text-field
      v-model="min"
      type="number"
      step="0.25"
      label="From"
      hide-details
      dense
      style="max-width:50px"
      class="mr-1"
      single-line
      @change="update"
    />
    <v-text-field
      v-model="max"
      type="number"
      step="0.25"
      hide-details
      dense
      style="max-width:50px"
      label="To"
      single-line
      @change="update"
    />
  </div>
</template>

<script>
export default {
  data: () => ({
    min: '',
    max: ''
  }),
  methods: {
    update() {
      this.$emit('update', { min: parseFloat(this.min), max: parseFloat(this.max) })
    }
  }
}
</script>
