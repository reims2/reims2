<template>
  <div>
    <v-row dense>
      <div class="text-h6">
        {{ eyeName }}
      </div>
      <v-col
        v-for="item in eye_data"
        :key="item.label"
        cols="12"
        class="py-0 pl-0"
      >
        <v-text-field
          v-model.number="eye_model[item.id]"
          :label="item.label"
          :rules="item.rules"
          type="number"
          step="0.25"
          @change="update"
        />
      </v-col>
      <v-col cols="12" class="py-0 pl-0">
        <v-text-field
          v-model.number="eye_model['add']"
          label="Add"
          type="number"
          step="0.25"
          :disabled="!addEnabled"
          :rules="addEnabled ? add_rules: []"
          @change="update"
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
    add_rules: [
      v => v === 0 || !!v || 'Item is required',
      v => (v >= 0 && v <= 10) || 'Item out of range'
    ],
    eye_data: [
      {
        label: 'Sphere',
        id: 'sphere',
        rules: [
          v => v === 0 || !!v || 'Item is required',
          v => (v >= -50 && v <= 50) || 'Item out of range'
        ]
      },
      {
        label: 'Cylinder',
        id: 'cylinder',
        rules: [
          v => v === 0 || !!v || 'Item is required',
          v => (v >= -8 && v <= 0) || 'Item out of range'
        ]
      },
      {
        label: 'Axis',
        id: 'axis',
        rules: [
          v => v === 0 || !!v || 'Item is required',
          v => (v >= 0 && v <= 180) || 'Item out of range'
        ]
      }
    ]
  }),
  methods: {
    update() {
      this.$emit('update', this.eye_model)
    }
  }
}
</script>
