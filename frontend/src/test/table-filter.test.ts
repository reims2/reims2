import { useTableFilter } from '@/composables/table-filter'

describe('useTableFilter', () => {
  it('is empty without filters', () => {
    expect(useTableFilter([]).filterString.value).toBe('')
  })

  it('joins type and eye filters into one RSQL query', () => {
    const typeFilter = ref(['single', 'multifocal'])
    const { filterString, eyeFilters } = useTableFilter(typeFilter)
    eyeFilters.od.sphere = { min: '1', max: '2.5' }
    eyeFilters.os.cylinder = { max: '-1' }
    expect(filterString.value).toBe(
      'glassesType==single,glassesType==multifocal;od.sphere>=1;od.sphere<=2.5;os.cylinder<=-1',
    )
  })

  it('swaps a reversed range', () => {
    const { filterString, eyeFilters } = useTableFilter([])
    eyeFilters.os.sphere = { min: '3', max: '-1' }
    expect(filterString.value).toBe('os.sphere>=-1;os.sphere<=3')
  })

  it('ignores values that are not numbers', () => {
    const { filterString, eyeFilters } = useTableFilter([])
    eyeFilters.od.sphere = { min: '', max: 'abc' }
    expect(filterString.value).toBe('')
  })

  it('resets all eye filters', () => {
    const { filterString, eyeFilters, resetFilters } = useTableFilter([])
    eyeFilters.od.cylinder = { min: '-2' }
    resetFilters()
    expect(filterString.value).toBe('')
  })
})
