import { useTableFilter } from '@/composables/table-filter'
import { Glasses, GlassesType } from '@/model/GlassesModel'
import { createGlasses } from './util'

function pair(sku: number, glassesType: GlassesType, odSphere: number, osCylinder = 0): Glasses {
  return {
    ...createGlasses(
      glassesType,
      { sphere: odSphere, cylinder: 0, axis: 0, add: 0 },
      { sphere: 0, cylinder: osCylinder, axis: 0, add: 0 },
    )[0],
    sku,
  }
}

const glasses = [
  pair(1, 'single', -3),
  pair(2, 'single', 1, -1.5),
  pair(3, 'multifocal', 2.5),
  pair(4, 'multifocal', 4, -0.5),
]
const skus = (result: Glasses[]) => result.map((g) => g.sku)

describe('useTableFilter', () => {
  it('returns all glasses without filters', () => {
    expect(skus(useTableFilter(glasses, []).filteredGlasses.value)).toEqual([1, 2, 3, 4])
  })

  it('combines type and eye filters', () => {
    const typeFilter = ref(['single', 'multifocal'])
    const { filteredGlasses, eyeFilters } = useTableFilter(glasses, typeFilter)
    eyeFilters.od.sphere = { min: '1', max: '2.5' }
    expect(skus(filteredGlasses.value)).toEqual([2, 3])
    eyeFilters.os.cylinder = { max: '-1' }
    expect(skus(filteredGlasses.value)).toEqual([2])
    typeFilter.value = ['multifocal']
    expect(skus(filteredGlasses.value)).toEqual([])
  })

  it('swaps a reversed range', () => {
    const { filteredGlasses, eyeFilters } = useTableFilter(glasses, [])
    eyeFilters.od.sphere = { min: '3', max: '-3' }
    expect(skus(filteredGlasses.value)).toEqual([1, 2, 3])
  })

  it('ignores values that are not numbers', () => {
    const { filteredGlasses, eyeFilters } = useTableFilter(glasses, [])
    eyeFilters.od.sphere = { min: '', max: 'abc' }
    expect(skus(filteredGlasses.value)).toEqual([1, 2, 3, 4])
  })

  it('resets all eye filters', () => {
    const { filteredGlasses, eyeFilters, resetFilters } = useTableFilter(glasses, [])
    eyeFilters.od.sphere = { min: '-2' }
    expect(skus(filteredGlasses.value)).toEqual([2, 3, 4])
    resetFilters()
    expect(skus(filteredGlasses.value)).toEqual([1, 2, 3, 4])
  })
})
