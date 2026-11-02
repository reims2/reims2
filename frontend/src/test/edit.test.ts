import { createTestingPinia } from '@pinia/testing'
import { useDeleteGlasses, useUndoDispension } from '@/composables/edit'
import { toastQueue } from '@/composables/toast'
import { ReimsAxiosError } from '@/lib/axios'
import { useGlassesStore } from '@/stores/glasses'
import { createGlassesEqualOdOs } from './util'

const badRequest = () => new ReimsAxiosError('Error 400', false, false, 'database down', 400)

describe('dispense errors', () => {
  beforeEach(() => {
    createTestingPinia()
    toastQueue.value = []
  })

  it('shows a 400 on dispense', async () => {
    vi.mocked(useGlassesStore().dispense).mockRejectedValue(badRequest())
    const [glasses] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })
    await useDeleteGlasses(glasses).deleteGlasses('DISPENSED')
    expect(toastQueue.value).toEqual([
      { color: 'error', timeout: -1, text: expect.stringContaining('database down') },
    ])
  })

  it('shows a 502 on dispense', async () => {
    vi.mocked(useGlassesStore().dispense).mockRejectedValue(
      new ReimsAxiosError('Server error', false, true, null, 502),
    )
    const [glasses] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })
    await useDeleteGlasses(glasses).deleteGlasses('DISPENSED')
    expect(toastQueue.value).toEqual([
      { color: 'error', timeout: -1, text: expect.stringContaining('retry later (Error 502)') },
    ])
  })

  it('warns instead of confirming when the pair was already dispensed', async () => {
    vi.mocked(useGlassesStore().dispense).mockResolvedValue(false)
    const onSuccess = vi.fn()
    const [glasses] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })
    await useDeleteGlasses(glasses, onSuccess).deleteGlasses('DISPENSED')
    expect(toastQueue.value).toEqual([
      { color: 'warning', text: expect.stringContaining('SKU 0001 was already dispensed') },
    ])
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('shows a 404 on undo', async () => {
    vi.mocked(useGlassesStore().undispense).mockRejectedValue(
      new ReimsAxiosError('Error 404', false, false, 'not found', 404),
    )
    const [glasses] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })
    await useUndoDispension().undo(glasses)
    expect(toastQueue.value).toEqual([
      { color: 'error', timeout: -1, text: expect.stringContaining('not found') },
    ])
  })

  it('shows a 502 on undo instead of promising a retry', async () => {
    vi.mocked(useGlassesStore().undispense).mockRejectedValue(
      new ReimsAxiosError('Error 502', false, true, 'Bad Gateway', 502),
    )
    const [glasses] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })
    await useUndoDispension().undo(glasses)
    expect(toastQueue.value).toEqual([
      { color: 'error', timeout: -1, text: expect.stringContaining('Bad Gateway') },
    ])
  })
})
