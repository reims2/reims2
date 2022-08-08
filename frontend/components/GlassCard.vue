<template>
  <v-tooltip
    v-model="showTooltip"
    bottom
  >
    <template #activator="toooltip">
      <v-card
        style="min-width: 270px;"
        class="mb-2"
        :loading="loading"
        v-bind="toooltip.attrs"
      >
        <v-card-title v-if="glass.sku">
          <div v-if="glass.score != null" class="d-flex align-center">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-chip
                  class="mr-2 px-2 white--text font-weight-medium"
                  :color="calcColor(glass.score)"
                  small
                  label
                  :ripple="false"
                  v-bind="attrs"
                  v-on="on"
                >
                  {{ glass.score.toFixed(2) }}
                </v-chip>
              </template>
              Result (Philscore) - lower values are better
            </v-tooltip>
          </div>
          <span class="mr-1">SKU</span> {{ glass.sku.toString().padStart(4, '0') }}
        </v-card-title>
        <v-card-subtitle class="text--primary pb-2 d-flex align-center">
          <span v-for="item in generalEyeData" :key="item.id" class="pr-2">
            <v-tooltip bottom :disabled="editable && edit == item.id">
              <template #activator="{ on, attrs }">
                <span class="no-child-padding" @click="edit = item.id">
                  <v-select
                    v-if="editable && edit == item.id"
                    :value="glass[item.id]"
                    :items="item.items"
                    auto-select-first
                    single-line
                    hide-details
                    style="max-width:130px"
                    autofocus
                    @input="value => startEdit(null, item.id, value)"
                    @blur="edit = ''"
                  />
                  <span v-else v-bind="attrs" v-on="on">
                    <v-icon small color="black">
                      {{ item.icon }}
                    </v-icon>
                    {{ glass[item.id] }}
                  </span>
                </span>
              </template>
              {{ item.desc }}
            </v-tooltip>
          </span>
        </v-card-subtitle>
        <v-card-text class="py-0">
          <v-container class="text--primary pa-0">
            <v-row dense>
              <v-col v-for="eye in eyes" :key="eye.key" cols=6>
                <div class="d-flex">
                  <div class="text-subtitle-1">
                    {{ eye.text }}
                  </div>
                  <div v-if="glass.score != null" class="d-flex align-center">
                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <v-chip
                          class="ml-2 px-2"
                          x-small
                          label
                          :ripple="false"
                          v-bind="attrs"
                          v-on="on"
                        >
                          {{ (eye.key == 'od' ? glass.odScore : glass.osScore).toFixed(2) }}
                        </v-chip>
                      </template>
                      PhilScore only for {{ eye.text }}
                    </v-tooltip>
                  </div>
                </div>
                <tr v-for="[dataKey, dataItem] in Object.entries(eyeData)" :key="dataKey" @click="edit = eye.key + dataKey">
                  <td class="text--secondary pr-2">
                    {{ dataItem.label }}
                  </td>
                  <td>
                    <editable-span
                      :value="dataItem.format(glass[eye.key][dataKey])"
                      :suffix="dataItem.suffix"
                      :rules="eyeRules[dataKey]"
                      :is-editing="editable && edit == eye.key + dataKey"
                      @submit="value => startEdit(eye.key, dataKey, value)"
                    />
                  </td>
                </tr>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="pt-0 mx-0">
          <v-btn
            v-if="editable && edit == ''"
            text
            class="mx-0"
            @click="showTooltip = !showTooltip"
          >
            Edit
          </v-btn>
          <v-btn
            v-if="editable && edit != ''"
            text
            class="mx-0"
            @click="edit = ''"
          >
            Cancel Edit
          </v-btn>
          <slot name="actions" />
        </v-card-actions>
      </v-card>
    </template>
    <span>Do you want to edit glasses? Simply <span class="font-weight-bold">click</span> on any value</span>
  </v-tooltip>
</template>

<script>
import { mapActions } from 'vuex'
import * as chroma from '../lib/chroma'
import { deepCopyGlasses, eyeRules, generalEyeData } from '../lib/util'
import EditableSpan from './EditableSpan.vue'

export default {
  components: { EditableSpan },
  props: {
    glass: {
      type: Object,
      required: true
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    eyeRules,
    eyes: [{
      text: 'OD',
      key: 'od'
    },
    {
      text: 'OS',
      key: 'os'
    }],
    edit: '',
    generalEyeData,
    loading: false,
    showTooltip: false
  }),
  computed: {
    eyeData() {
      const tempData = {
        sphere: {
          label: 'SPH',
          format: v => this.formatNumber(v, 2),
          suffix: 'D',
          step: 0.25
        },
        cylinder: {
          label: 'CYL',
          format: v => this.formatNumber(v, 2),
          suffix: 'D'
        },
        axis: {
          label: 'Axis',
          format: v => parseInt(v).toString().padStart(3, '0'),
          suffix: ''
        }
      }
      if (this.glass.glassesType !== 'single') {
        tempData.add = {
          label: 'Add',
          format: v => this.formatNumber(v, 2),
          suffix: 'D'
        }
      }
      return tempData
    }
  },
  watch: {
    edit() {
      this.showTooltip = false
    }
  },
  methods: {
    ...mapActions({
      editGlasses: 'glasses/edit'
    }),
    calcColor(val) {
      const scale = chroma.scale(['#BF360C', '#FF9800', '#009688']).domain([2.5, 1.0, 0])
      return scale(val).hex()
    },
    formatNumber(val, decimals) {
      return (val < 0 ? '-' : '+') + Math.abs(Number(val)).toFixed(decimals)
    },
    async startEdit(eyeKey, dataKey, value) {
      if (!this.editable) return // just as a "safety" fallback
      const newGlasses = deepCopyGlasses(this.glass)
      if (eyeKey == null) {
        // edited a glasses general item like size or appearance
        newGlasses[dataKey] = value
      } else {
        // edited a specific eye
        value = Number(value)
        if (this.eyeData[dataKey].step) {
          value = Math.ceil(Math.abs(value) / this.eyeData[dataKey].step) * this.eyeData[dataKey].step
          if (isNaN(value)) return
        }
        newGlasses[eyeKey][dataKey] = Number(value)
      }
      try {
        this.loading = true
        await this.editGlasses(newGlasses)
      } catch (error) {
        if (error.response && error.response.status < 500) {
          // TODO catch network errors because they'll be retried.
          this.edit = ''
          this.$store.commit('setError', `Glasses can't be edited, sorry (Error ${error.status})`)
        } else {
          this.$store.commit('setError', `Editing was not possible because the server didn't respond. Please retry (Error ${error.status}).`)
        }
        this.loading = false
        return
      }
      this.loading = false
      this.edit = ''
      this.$emit('edited', newGlasses)
    }
  }

}
</script>

<style scoped>
.no-child-padding .v-text-field {
  padding: 0px;
  margin: 0px;
}
</style>
