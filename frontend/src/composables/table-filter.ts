import { GlassesEyeIndex } from '@/model/GlassesModel'
import { MinMaxObject } from '@/model/ReimsModel'
import { MaybeRefOrGetter } from 'vue'

export const useTableFilter = (glassesTypeFilter: MaybeRefOrGetter<string[]>) => {
  const eyeFilters = reactive({
    od: {
      sphere: {} as MinMaxObject,
      cylinder: {} as MinMaxObject,
    },
    os: {
      sphere: {} as MinMaxObject,
      cylinder: {} as MinMaxObject,
    },
  })

  type EyeValueKey = 'sphere' | 'cylinder'
  const filterString = computed(() => {
    let filterString = ''
    const typeFilter = createSingleTypeFilter(toValue(glassesTypeFilter))
    if (typeFilter) filterString += typeFilter + ';'
    const eyeKeys: GlassesEyeIndex[] = ['od', 'os']
    const eyeValueKeys: EyeValueKey[] = ['sphere', 'cylinder']
    for (const eyeName of eyeKeys) {
      for (const valName of eyeValueKeys) {
        const filter = createSingleFilter(eyeFilters[eyeName][valName], `${eyeName}.${valName}`)
        if (filter) filterString += filter + ';'
      }
    }
    return filterString.slice(0, -1)
  })

  function createSingleFilter(value: MinMaxObject, filterName: string): string | null {
    if (value == null) return null

    const min = value.min != null ? parseFloat(value.min) : NaN
    const max = value.max != null ? parseFloat(value.max) : NaN

    const minText = `${filterName}>=${min}`
    const maxText = `${filterName}<=${max}`

    if (!isNaN(min) && !isNaN(max)) {
      // swap min max automatically if entered wrongly
      if (max < min) return `${filterName}>=${max};${filterName}<=${min}`
      return minText + ';' + maxText
    } else if (!isNaN(min)) return minText
    else if (!isNaN(max)) return maxText
    else return null
  }

  function createSingleTypeFilter(value: string[]): string | null {
    if (value.length === 0) return null
    let filterString = ''
    for (const el of value) {
      if (el === '') continue
      filterString += `glassesType==${el},`
    }
    return filterString.slice(0, -1)
  }

  function resetFilters() {
    eyeFilters.od.sphere = {}
    eyeFilters.od.cylinder = {}
    eyeFilters.os.sphere = {}
    eyeFilters.os.cylinder = {}
  }
  return {
    glassesTypeFilter,
    filterString,
    resetFilters,
    eyeFilters,
  }
}
