import { resetEyeInput, sanitizeEyeValues } from '@/util/eye-utils'
import { DisplayedEye, EyeSearch } from '@/model/GlassesModel'

const displayed = (eye: Partial<DisplayedEye>): DisplayedEye => ({
  sphere: '',
  cylinder: '',
  axis: '',
  add: '',
  ...eye,
})

describe('sanitizeEyeValues', () => {
  it('rounds away from zero to the next quarter step', () => {
    const eye = sanitizeEyeValues(
      displayed({ sphere: '1.2', cylinder: '-0.1', axis: '10', add: '1.1' }),
    )
    expect(eye).toEqual({ sphere: 1.25, cylinder: -0.25, axis: 10, add: 1.25 })
    expect(sanitizeEyeValues(displayed({ sphere: '-1.1' })).sphere).toBe(-1.25)
  })

  it('forces cylinder to minus form', () => {
    expect(
      sanitizeEyeValues(displayed({ sphere: '1', cylinder: '0.5', axis: '90' })).cylinder,
    ).toBe(-0.5)
  })

  it('treats axis 180 as 0', () => {
    expect(sanitizeEyeValues(displayed({ sphere: '1', cylinder: '-1', axis: '180' })).axis).toBe(0)
  })

  it('drops the axis when there is no cylinder', () => {
    expect(sanitizeEyeValues(displayed({ sphere: '1', cylinder: '0', axis: '90' })).axis).toBe(0)
    expect(sanitizeEyeValues(displayed({ sphere: '1', axis: '90' })).axis).toBe(0)
  })

  it('turns empty or invalid input into 0', () => {
    expect(sanitizeEyeValues(displayed({ sphere: 'abc' }))).toEqual({
      sphere: 0,
      cylinder: 0,
      axis: 0,
      add: 0,
    })
    expect(sanitizeEyeValues(undefined)).toEqual({ sphere: 0, cylinder: 0, axis: 0, add: 0 })
  })

  it('keeps isBAL only for search eyes', () => {
    const search: EyeSearch = { ...displayed({ sphere: '1' }), isBAL: true }
    expect(sanitizeEyeValues(search)).toEqual({
      sphere: 1,
      cylinder: 0,
      axis: 0,
      add: 0,
      isBAL: true,
    })
    expect(sanitizeEyeValues(displayed({ sphere: '1' }))).not.toHaveProperty('isBAL')
  })
})

describe('resetEyeInput', () => {
  it('clears all values and BAL', () => {
    const eye: EyeSearch = { sphere: '1', cylinder: '-1', axis: '90', add: '2', isBAL: true }
    resetEyeInput(eye)
    expect(eye).toEqual({ sphere: '', cylinder: '', axis: '', add: '', isBAL: false })
  })
})
