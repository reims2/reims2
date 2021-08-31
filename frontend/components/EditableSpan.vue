<template>
  <span v-if="isEditing">
    <v-text-field
      :value="value"
      :rules="rules"
      dense
      single-line
      hide-details
      style="max-width: 60px"
      class="pb-1"
      @update:error="val => hasError = val"
      @change="val => submit(val)"
    />
  </span>
  <span v-else>
    {{ value }} {{ suffix }}
  </span>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      required: true
    },
    isEditing: {
      type: Boolean,
      required: true
    },
    suffix: {
      type: String,
      default: ''
    },
    rules: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      hasError: false
    }
  },
  methods: {
    submit(val) {
      if (!this.hasError) {
        this.$emit('change', val)
      }
    }
  }

}
</script>
