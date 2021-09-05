<template>
  <v-text-field
    v-if="isEditing"
    v-model="model"
    :rules="rules"
    dense
    single-line
    hide-details
    style="max-width: 60px"
    class="pb-1"
    autofocus
    @update:error="val => hasError = val"
    @keyup.enter="submit"
    @blur="$emit('blur')"
  />
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
      hasError: false,
      model: this.value
    }
  },
  methods: {
    submit() {
      if (!this.hasError) {
        this.$emit('submit', this.model)
      }
    }
  }

}
</script>
