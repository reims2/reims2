import { deepCopyGlasses, eyeRules, glassesMetaUIData, isValidForRules } from '@/util/glasses-utils'
import { createGlasses } from './util'

describe('eyeRules', () => {
  it.each([
    ['1.25', true],
    ['-1.5', true],
    ['2', true],
    // 0.2 and 0.7 are accepted as shorthand and rounded up later
    ['1.2', true],
    ['1.7', true],
    ['1.3', false],
    ['30.25', false],
    ['', false],
    ['abc', false],
  ])('sphere %s valid: %s', (value, valid) => {
    expect(isValidForRules(value, eyeRules.sphere)).toBe(valid)
  })

  it.each([
    ['', true],
    ['-6', true],
    ['6.25', false],
  ])('cylinder %s valid: %s', (value, valid) => {
    expect(isValidForRules(value, eyeRules.cylinder)).toBe(valid)
  })

  it.each([
    ['090', true],
    ['180', true],
    ['90', false],
    ['181', false],
    ['45.5', false],
    ['', false],
  ])('axis %s valid: %s', (value, valid) => {
    expect(isValidForRules(value, eyeRules.axis)).toBe(valid)
  })

  it.each([
    ['2.5', true],
    ['8', true],
    ['8.25', false],
    ['-1', false],
    ['', false],
  ])('add %s valid: %s', (value, valid) => {
    expect(isValidForRules(value, eyeRules.add)).toBe(valid)
  })
})

describe('glassesMetaUIData rules', () => {
  it('accepts any prefix of an allowed value', () => {
    const typeRules = glassesMetaUIData.glassesType.rules
    expect(isValidForRules('s', typeRules)).toBe(true)
    expect(isValidForRules('multi', typeRules)).toBe(true)
    expect(isValidForRules('x', typeRules)).toBe(false)
    expect(isValidForRules('', typeRules)).toBe(false)
    expect(isValidForRules('c', glassesMetaUIData.glassesSize.rules)).toBe(true)
    expect(isValidForRules('f', glassesMetaUIData.appearance.rules)).toBe(true)
  })
})

describe('deepCopyGlasses', () => {
  it('does not share eyes with the original', () => {
    const eye = { sphere: 1, cylinder: 0, axis: 0, add: 0 }
    const [original] = createGlasses('single', { ...eye }, { ...eye })
    const copy = deepCopyGlasses(original)
    copy.od.sphere = 5
    expect(original.od.sphere).toBe(1)
    expect(copy).not.toHaveProperty('dispense.previousSku')
  })
})
