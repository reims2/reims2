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
          v-model="eye_model[item.id]"
          :label="item.label"
          :rules="eye_rules"
          @blur="update"
        />
      </v-col>
      <v-col cols="12" class="py-0 pl-0">
        <v-text-field
          v-model="eye_model['add']"
          label="Add"
          :disabled="!addEnabled"
          :rules="addEnabled ? eye_rules: []"
          @blur="update"
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
    eye_rules: [
      v => !isNaN(v) || 'Item must be numeric',
      v => (v >= -20 && v <= 20) || 'Item out of range',
      v => !!v || 'Item is required'
    ],
    eye_data: [
      {
        label: 'Sphere',
        id: 'sphere'
      },
      {
        label: 'Cylinder',
        id: 'cylinder'
      },
      {
        label: 'Axis',
        id: 'axis'
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
