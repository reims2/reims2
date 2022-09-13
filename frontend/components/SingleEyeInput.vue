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
import { eyeRules } from '../lib/util'
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
      cylinder: false, // allow (initial) empty fields
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
          prefix: this.value.sphere > 0 ? '+' : ''
        },
        cylinder: {
          label: 'Cylinder (minus form)',
          step: 0.25
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
      let newVal = this.value[id]
      if (id === 'cylinder') {
        // replace empty cylinder with 0
        if (newVal === undefined || newVal == null || newVal === '') {
          this.input(id, 0)
          this.$emit('change', true)
          return
        }
        // always use negative cylinder internally
        newVal = -Math.abs(Number(newVal))
      }
      if (!this.hasError[id]) {
        const step = this.eye_data[id].step
        if (step > 0) {
          const number = Math.ceil(Math.abs(Number(newVal)) / step) * step
          if (!isNaN(number)) {
            // re-add the sign
            // nicer number formatting with leading decimals, doesn't really work now because we use "number" type input fields
            const numberString = (Number(newVal) < 0 ? '-' : '') + number.toFixed(2)
            this.input(id, Number(numberString))
            this.$emit('change', true)
          }
        }
      }
    }
  }
}
</script>
