import { Glasses, GlassesEyeIndex } from '@/model/GlassesModel'
import { MinMaxObject } from '@/model/ReimsModel'
import { MaybeRefOrGetter } from 'vue'

export const useTableFilter = (
  glasses: MaybeRefOrGetter<Glasses[]>,
  glassesTypeFilter: MaybeRefOrGetter<string[]>,
) => {
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
  const filteredGlasses = computed(() => {
    const types = toValue(glassesTypeFilter).filter((type) => type !== '')
    const eyeKeys: GlassesEyeIndex[] = ['od', 'os']
    const eyeValueKeys: EyeValueKey[] = ['sphere', 'cylinder']
    const rangeFilters = eyeKeys.flatMap((eyeName) =>
      eyeValueKeys.flatMap((valName) => {
        const range = parseRange(eyeFilters[eyeName][valName])
        return range ? [{ eyeName, valName, range }] : []
      }),
    )
    return toValue(glasses).filter(
      (glass) =>
        (types.length === 0 || types.includes(glass.glassesType)) &&
        rangeFilters.every(({ eyeName, valName, range: [min, max] }) => {
          const value = glass[eyeName][valName]
          return value >= min && value <= max
        }),
    )
  })

  function parseRange(value: MinMaxObject): [number, number] | null {
    const min = parseFloat(value.min ?? '')
    const max = parseFloat(value.max ?? '')
    if (isNaN(min) && isNaN(max)) return null
    const range: [number, number] = [isNaN(min) ? -Infinity : min, isNaN(max) ? Infinity : max]
    // swap min max automatically if entered wrongly
    return range[0] <= range[1] ? range : [range[1], range[0]]
  }

  function resetFilters() {
    eyeFilters.od.sphere = {}
    eyeFilters.od.cylinder = {}
    eyeFilters.os.sphere = {}
    eyeFilters.os.cylinder = {}
  }
  return {
    glassesTypeFilter,
    filteredGlasses,
    resetFilters,
    eyeFilters,
  }
}
