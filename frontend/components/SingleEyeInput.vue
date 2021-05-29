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
          v-model="eye_model[id]"
          :label="item.label"
          :rules="!item.disabled ? item.rules : []"
          :step="item.step"
          :disabled="item.disabled"
          @update:error="val => hasError[id] = val"
          @change="update(id)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    eyeName: {
      type: String,
      required: true
    },
    addEnabled: {
      type: Boolean,
      required: true
    }
  },
  data: () => ({
    eye_model: {},
    hasError: {}
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
            v => v == null || v.length < 1 || v[0] === '+' || v[0] === '-' || 'Please start with + or -'
          ]
        },
        cylinder: {
          label: 'Cylinder',
          // prefix: '‒',
          negative: true,
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
          prefix: '+',
          rules: [
            v => (v != null && !!v.length) || 'Required',
            v => !isNaN(parseFloat(v)) || 'Enter a valid number',
            v => Number.isInteger(parseFloat(v)) || 'Must be an integer',
            // eslint-disable-next-line eqeqeq
            v => !v || v == 0 || v.length >= 3 || 'Enter 3 digits (leading zeros)',
            v => v >= 0 || 'Must be positive',
            v => v <= 180 || 'Maximum is 180'
          ]
        },
        add: {
          label: 'Add',
          disabled: !this.addEnabled,
          step: 0.25,
          prefix: '+',
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
    update(id) {
      if (!this.hasError[id]) {
        const step = this.eye_data[id].step
        if (step > 0) {
          const number = Math.ceil(Math.abs(this.eye_model[id]) / step) * step
          if (!isNaN(number)) {
            const numberString = (Number(this.eye_model[id]) >= 0 ? '+' : '-') + number.toFixed(2)
            this.eye_model[id] = numberString
          }
        }
      }

      this.$emit('update', this.eye_model)
    }
  }
}
</script>
