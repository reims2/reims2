import {
  formatAxis,
  formatDiopter,
  formatGlassesForDisplay,
  formatSku,
  getAndConvertSku,
} from '@/util/format-glasses'
import { Glasses } from '@/model/GlassesModel'
import { createGlasses } from './util'

const eye = { sphere: 1, cylinder: -0.5, axis: 90, add: 2 }

describe('formatDiopter', () => {
  it('shows two decimals and a plus sign for zero and positive values', () => {
    expect(formatDiopter(1.5)).toBe('+1.50')
    expect(formatDiopter(0)).toBe('+0.00')
    expect(formatDiopter(-0.25)).toBe('-0.25')
    expect(formatDiopter(1.5, false)).toBe('1.50')
    expect(formatDiopter(undefined)).toBe('')
  })
})

describe('formatAxis', () => {
  it('pads to three digits', () => {
    expect(formatAxis(5)).toBe('005')
    expect(formatAxis(180)).toBe('180')
    expect(formatAxis(undefined)).toBe('')
  })
})

describe('SKU formatting', () => {
  it('pads to four digits and marks a missing SKU', () => {
    expect(formatSku(42)).toBe('0042')
    expect(formatSku(null)).toBe('????')
    expect(formatSku(0)).toBe('????')
  })

  it('falls back to the previous SKU of dispensed glasses', () => {
    const [glasses] = createGlasses('single', eye, eye)
    expect(getAndConvertSku(glasses)).toBe('0001')
    const dispensed: Glasses = {
      ...glasses,
      sku: null,
      dispense: { modifyDate: null, previousSku: 7, dispenseReason: 'DISPENSED' },
    }
    expect(getAndConvertSku(dispensed)).toBe('0007')
    expect(getAndConvertSku({ ...glasses, sku: null })).toBe('????')
  })
})

describe('formatGlassesForDisplay', () => {
  it('hides the add of single vision glasses', () => {
    const [single] = createGlasses('single', eye, eye)
    expect(formatGlassesForDisplay(single).od).toEqual({
      sphere: '+1.00',
      cylinder: '-0.50',
      axis: '090',
      add: '',
    })
    const [multifocal] = createGlasses('multifocal', eye, eye)
    expect(formatGlassesForDisplay(multifocal).os.add).toBe('+2.00')
  })
})
