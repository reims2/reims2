import { fireEvent, within } from '@testing-library/vue'
import GlassInput from '@/components/GlassInput.vue'
import { EyeSearch, GlassesInput } from '@/model/GlassesModel'
import { renderWithVuetify } from './util'

const emptyEye = (): EyeSearch => ({ sphere: '', cylinder: '', axis: '', add: '', isBAL: false })

function renderInput(syncEyes: boolean) {
  const model = reactive<GlassesInput>({
    glassesType: 'multifocal',
    appearance: '',
    glassesSize: '',
    od: emptyEye(),
    os: emptyEye(),
  })
  const wrapper = renderWithVuetify(GlassInput, { props: { modelValue: model, syncEyes } })
  const eye = (name: 'OD' | 'OS') => within(wrapper.getByRole('group', { name }))
  return { model, wrapper, eye }
}

describe('GlassInput', () => {
  it('copies the OD add to OS while the eyes are synced', async () => {
    const { model, eye } = renderInput(true)
    await fireEvent.update(eye('OD').getByLabelText('Additional'), '2.5')
    expect(model.os.add).toBe('2.5')
  })

  it('stops syncing once the OS add is changed by hand', async () => {
    const { model, wrapper, eye } = renderInput(true)
    await fireEvent.update(eye('OS').getByLabelText('Additional'), '1')
    expect(wrapper.emitted()['update:syncEyes']).toEqual([[false]])
    expect(model.od.add).toBe('')
  })

  it('leaves OS alone without syncing', async () => {
    const { model, eye } = renderInput(false)
    await fireEvent.update(eye('OD').getByLabelText('Additional'), '2.5')
    expect(model.os.add).toBe('')
  })

  it('gives a BAL eye the sphere of the other eye and nothing else', async () => {
    const { model, eye } = renderInput(false)
    Object.assign(model.os, { sphere: '-2', cylinder: '-1', axis: '090', add: '2' })
    Object.assign(model.od, { sphere: '1', cylinder: '-0.5', axis: '010', add: '2' })
    await fireEvent.click(eye('OD').getByLabelText('BAL lens (Disable OD)'))
    expect(model.od).toEqual({ sphere: '-2', cylinder: '', axis: '', add: '', isBAL: true })
    expect(model.os.isBAL).toBe(false)
  })
})
