<template>
  <div>
    <v-row dense>
      <div class="text-h5 pb-2">
        {{ eyeName }}
      </div>
      <v-col
        v-for="[id, item] in Object.entries(eye_data)"
        :key="id"
        cols="12"
        class="py-0 pl-0"
      >
        <v-text-field
          outlined
          dense
          :value="value[id]"
          type="number"
          :label="item.label"
          :rules="!item.disabled ? eyeRules[id] : []"
          :step="item.step"
          :disabled="item.disabled"
          :prefix="value[id] != null ? item.prefix : ''"
          @input="test => input(id, test)"
          @update:error="val => hasError[id] = val"
          @blur="update(id)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { eyeRules } from '~/lib/util'
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
    eyeRules,
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
          step: 0.25
        },
        cylinder: {
          label: 'Cylinder',
          step: 0.25,
          prefix: this.value.cylinder <= 0 ? '' : '-'
        },
        axis: {
          label: 'Axis'
        },
        add: {
          label: 'Additional',
          disabled: !this.addEnabled,
          step: 0.25,
          prefix: '+'
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
            this.input(id, Number(numberString))
            this.$emit('change', true)
          }
        }
      }
    }
  }
}
</script>
