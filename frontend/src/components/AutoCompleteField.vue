<template>
  <v-text-field
    ref="input"
    v-model="inputVal"
    :label="label"
    :rules="rules"
    :hint="hint"
    :autofocus="first && !rootStore.isMobile"
    outlined
    clearable
    :persistent-hint="persistentHint"
    hide-details="auto"
    autocorrect="off"
    autocapitalize="off"
    @keyup.a.stop
    @keyup.s.stop
    @blur="autoComplete(id)"
    @focus="$event.target.select()"
  />
</template>

<script>
import { generalEyeData } from '../lib/util'

import { useRootStore } from '@/stores/root'
export default {
  setup() {
    const rootStore = useRootStore()
    return {
      rootStore
    }
  },
  props: {
    value: {
      type: String,
      required: false,
      default: ''
    },
    label: {
      type: String,
      required: true
    },
    rules: {
      type: Array,
      required: true
    },
    hint: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    first: {
      type: Boolean,
      required: false,
      default: false
    },
    persistentHint: {
      type: [Boolean, String],
      required: false,
      default: false
    }
  },
  data: () => ({

  }),
  computed: {
    inputVal: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  methods: {
    autoComplete(id) {
      /** autocomplete item data based on first characters. i.e. for id=glassesType return single for character s.
        * Otherwise emit no input i.e. no change */
      const glassesString = this.inputVal
      if (!glassesString || typeof glassesString !== 'string' || glassesString === '') return
      const data = generalEyeData.find((obj) => { return obj.id === id })
      if (!data) return

      for (const item of data.items) {
        if (item.startsWith(glassesString.toLowerCase())) return this.$emit('input', item)
      }
    },
    focus() {
      this.$refs.input.focus()
    }
  }
}
</script>
