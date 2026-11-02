import { fireEvent, RenderResult } from '@testing-library/vue'
import SingleEyeInput from '@/components/SingleEyeInput.vue'
import { DisplayedEye, EyeSearch } from '@/model/GlassesModel'
import { renderWithVuetify } from './util'

function renderEye(eye: Partial<EyeSearch>, addEnabled = true) {
  const modelValue = { sphere: '', cylinder: '', axis: '', add: '', ...eye }
  return renderWithVuetify(SingleEyeInput, { props: { eyeName: 'OD', modelValue, addEnabled } })
}

function lastEmitted(wrapper: RenderResult) {
  const emitted = wrapper.emitted()['update:modelValue'] as DisplayedEye[][] | undefined
  return emitted?.at(-1)?.[0]
}

describe('SingleEyeInput', () => {
  it('keeps the S and A shortcut letters out of the field, but not Ctrl+A', () => {
    const sphere = renderEye({}).getByLabelText('Sphere')
    const prevented = (init: KeyboardEventInit) => {
      const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
      sphere.dispatchEvent(event)
      return event.defaultPrevented
    }
    expect(prevented({ key: 's' })).toBe(true)
    expect(prevented({ key: 'A', shiftKey: true })).toBe(true)
    expect(prevented({ key: 'a', ctrlKey: true })).toBe(false)
  })

  it('rounds the sphere to a quarter step on blur', async () => {
    const wrapper = renderEye({ sphere: '1.2' })
    await fireEvent.blur(wrapper.getByLabelText('Sphere'))
    expect(lastEmitted(wrapper)?.sphere).toBe('1.25')
  })

  it('leaves values that break a rule for the user to fix', async () => {
    const wrapper = renderEye({ sphere: '1.3' })
    await fireEvent.blur(wrapper.getByLabelText('Sphere'))
    expect(lastEmitted(wrapper)).toBeUndefined()
  })

  it('turns a plus cylinder into minus form', async () => {
    const wrapper = renderEye({ sphere: '1', cylinder: '0.5', axis: '090' })
    await fireEvent.blur(wrapper.getByLabelText('Cylinder (minus form)'))
    expect(lastEmitted(wrapper)?.cylinder).toBe('-0.50')
  })

  it('clears the axis when the cylinder is zero or empty', async () => {
    const wrapper = renderEye({ sphere: '1', cylinder: '', axis: '090' })
    await fireEvent.blur(wrapper.getByLabelText('Cylinder (minus form)'))
    expect(lastEmitted(wrapper)).toMatchObject({ cylinder: '0.00', axis: '' })
  })

  it.each([
    ['0', true],
    ['-1', false],
  ])('with cylinder %s the axis is disabled: %s', (cylinder, disabled) => {
    expect(renderEye({ cylinder }).getByLabelText('Axis')).toHaveProperty('disabled', disabled)
  })

  it('disables the add for single vision', () => {
    expect(renderEye({}, false).getByLabelText('Additional')).toHaveProperty('disabled', true)
  })

  it('offers BAL only when searching', async () => {
    expect(renderEye({}).queryByLabelText('BAL lens (disables OD)')).toBeNull()
    const wrapper = renderEye({ isBAL: false })
    await fireEvent.click(wrapper.getByLabelText('BAL lens (disables OD)'))
    expect(lastEmitted(wrapper)).toMatchObject({ isBAL: true })
  })
})
