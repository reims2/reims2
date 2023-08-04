import { GlassesEyeIndex } from '@/model/GlassesModel'
import { MinMaxObject } from '@/model/ReimsModel'

export const useTableFilter = () => {
  const glassesTypeFilter = ref<string[]>([])
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
    const typeFilter = createSingleTypeFilter(glassesTypeFilter.value)
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

    const min = value.min != null && !isNaN(value.min) ? `${filterName}>=${value.min}` : null
    const max = value.max != null && !isNaN(value.max) ? `${filterName}<=${value.max}` : null
    if (min != null && max != null) {
      // swap min max automatically if entered wrongly
      if (max < min) return max + ';' + min
      else return min + ';' + max
    } else if (min != null) return min
    else if (max != null) return max
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

  function updateEyeFilter(value: MinMaxObject, eye: GlassesEyeIndex, child: EyeValueKey) {
    eyeFilters[eye][child] = value
  }

  function resetFilters() {
    glassesTypeFilter.value = []
    eyeFilters.od.sphere = {}
    eyeFilters.od.cylinder = {}
    eyeFilters.os.sphere = {}
    eyeFilters.os.cylinder = {}
  }
  return {
    glassesTypeFilter,
    filterString,
    resetFilters,
    updateEyeFilter,
  }
}
