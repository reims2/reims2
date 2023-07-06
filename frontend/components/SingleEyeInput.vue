<template>
  <div>
    <v-row dense>
      <v-col class="text-h5 pb-2">
        <div :class="isBAL ? 'text--secondary' : ''">
          {{ eyeName }}
        </div>
      </v-col>
      <v-col
        v-for="[id, item] in Object.entries(eye_data)"
        :key="id"
        cols="12"
        class="py-0 pl-0"
      >
        <v-text-field
          outlined
          dense
          type="number"
          :value="eye_data[id].value"
          :label="item.label"
          :rules="!(item.disabled || isBAL) ? eyeRules[id] : []"
          :step="item.step"
          :disabled="item.disabled || isBAL"
          :prefix="eye_data[id].value != null ? item.prefix : ''"
          @input="val => input(id, val)"
          @update:error="val => hasError[id] = val"
          @blur="update(id)"
          @focus="$event.target.select()"
          @keydown.s.prevent
          @keydown.a.prevent
        />
      </v-col>
      <v-col cols="12" class="pa-0 pb-4">
        <v-checkbox
          :input-value="isBAL"
          tabindex="-1"
          class="py-0 my-0"
          :label="`BAL lens (Disable ${eyeName})`"
          hide-details
          @change="val => input('isBAL', val)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { eyeRules } from '../lib/util'
export default {
  props: {
    eyeName: {
      type: String,
      required: true
    },
    axis: {
      type: [String, Number],
      required: false,
      default: ''
    },
    sphere: {
      type: [String, Number],
      required: false,
      default: ''
    },
    add: {
      type: [String, Number],
      required: false,
      default: ''
    },
    cylinder: {
      type: [String, Number],
      required: false,
      default: ''
    },
    addEnabled: {
      type: Boolean,
      default: true
    },
    balEnabled: {
      type: Boolean,
      default: false
    },
    isBAL: {
      type: Boolean,
      default: false
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
          // prefix: this.sphere > 0 ? '+' : '',
          value: this.sphere
        },
        cylinder: {
          label: 'Cylinder (minus form)',
          step: 0.25,
          value: this.cylinder
        },
        axis: {
          label: 'Axis',
          disabled: this.cylinder === '' || this.cylinder === '0' || this.cylinder === 0,
          value: this.axis
        },
        add: {
          label: 'Additional',
          disabled: !this.addEnabled,
          step: 0.25,
          prefix: '+',
          value: this.add
        }
      }
    }
  },
  methods: {
    input(id, value) {
      this.$emit('input', { id, value })
    },
    update(id) {
      let newVal = this.eye_data[id].value
      if (id === 'cylinder') {
        // replace empty cylinder with 0
        if (newVal === undefined || newVal == null || newVal === '') newVal = 0

        // always use negative cylinder internally
        newVal = -Math.abs(Number(newVal))

        if (newVal === 0) {
          // emit cylinder value here already to force update
          this.input(id, 0)
          // reset axis if cylinder is 0 and force update
          this.input('axis', '000')
          return
        }
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
          }
        }
      }
    }
  }
}
</script>
