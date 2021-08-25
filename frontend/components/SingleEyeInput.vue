<template>
  <div>
    <v-row dense>
      <div class="text-h6">
        {{ eyeName }}
      </div>
      <v-col
        v-for="[id, item] in Object.entries(eye_data)"
        :key="id"
        cols="12"
        class="py-0 pl-0"
      >
        <v-text-field
          :value="value[id]"
          :label="item.label"
          :rules="!item.disabled ? item.rules : []"
          :step="item.step"
          :disabled="item.disabled"
          @input="test => input(id, test)"
          @update:error="val => hasError[id] = val"
          @blur="update(id)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      required: true
    },
    eyeName: {
      type: String,
      required: true
    },
    addEnabled: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    hasError: { // workaround, see https://stackoverflow.com/a/59439106/4026792
      sphere: true,
      cylinder: true,
      axis: true,
      add: true
    }
  }),
  computed: {
    eye_data() {
      return {
        sphere: {
          label: 'Sphere',
          step: 0.25,
          rules: [
            v => (v != null && !!v.length) || 'Required',
            v => !isNaN(parseFloat(v)) || 'Enter a valid number',
            v => (v >= -50 && v <= 50) || 'Out of range',
            v => v == null || v.length < 1 || v[0] === '+' || v[0] === '-' || (v[0] === '0' && v.length === 0) || 'Please start with + or -'
          ]
        },
        cylinder: {
          label: 'Cylinder',
          step: 0.25,
          rules: [
            v => (v != null && !!v.length) || 'Required',
            v => !isNaN(parseFloat(v)) || 'Enter a valid number',
            v => v <= 0 || 'Must be negative',
            v => v >= -8 || 'Out of range'
          ]
        },
        axis: {
          label: 'Axis',
          rules: [
            v => (v != null && !!v.length) || 'Required',
            v => !isNaN(parseFloat(v)) || 'Enter a valid number',
            v => Number.isInteger(parseFloat(v)) || 'Must be an integer',
            v => v >= 0 || 'Must be positive',
            v => v <= 180 || 'Maximum is 180',
            // eslint-disable-next-line eqeqeq
            v => v != 0 || '0 is not allowed, use 180', // fixme ask diane if it should be allowed (but then convert it to 180!!! it's important for philscore)
            v => !v || v.length >= 3 || 'Enter 3 digits (leading zeros)'
          ]
        },
        add: {
          label: 'Additional',
          disabled: !this.addEnabled,
          step: 0.25,
          rules: [
            v => (v != null && !!v.length) || 'Required for bifocals',
            v => !isNaN(parseFloat(v)) || 'Enter a valid number',
            v => v >= 0 || 'Must be positive',
            v => v <= 10 || 'Maximum is 10'
          ]
        }
      }
    }
  },
  methods: {
    input(id, newVal) {
      this.$emit('input', { ...this.value, [id]: newVal })
    },
    update(id) {
      if (!this.hasError[id]) {
        const step = this.eye_data[id].step
        if (step > 0) {
          const number = Math.ceil(Math.abs(this.value[id]) / step) * step
          if (!isNaN(number)) {
            const numberString = (Number(this.value[id]) >= 0 ? '+' : '-') + number.toFixed(2)
            this.$emit('input', { ...this.value, [id]: numberString })
            this.$emit('change', true)
          }
        }
      }
    }
  }
}
</script>
