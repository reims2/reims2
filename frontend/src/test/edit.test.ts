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
    await useDeleteGlasses(1234).deleteGlasses('DISPENSED')
    expect(toastQueue.value).toEqual([
      { color: 'error', text: expect.stringContaining('database down') },
    ])
  })

  it('shows a 502 on dispense', async () => {
    vi.mocked(useGlassesStore().dispense).mockRejectedValue(
      new ReimsAxiosError('Server error', false, true, null, 502),
    )
    await useDeleteGlasses(1234).deleteGlasses('DISPENSED')
    expect(toastQueue.value).toEqual([
      { color: 'error', text: expect.stringContaining('retry later (Error 502)') },
    ])
  })

  it('shows a 404 on undo', async () => {
    vi.mocked(useGlassesStore().undispense).mockRejectedValue(
      new ReimsAxiosError('Error 404', false, false, 'not found', 404),
    )
    const [glasses] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })
    await useUndoDispension().undo(glasses)
    expect(toastQueue.value).toEqual([
      { color: 'error', text: expect.stringContaining('not found') },
    ])
  })

  it('shows a 502 on undo instead of promising a retry', async () => {
    vi.mocked(useGlassesStore().undispense).mockRejectedValue(
      new ReimsAxiosError('Error 502', false, true, 'Bad Gateway', 502),
    )
    const [glasses] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })
    await useUndoDispension().undo(glasses)
    expect(toastQueue.value).toEqual([
      { color: 'error', text: expect.stringContaining('Bad Gateway') },
    ])
  })

  it('confirms a sent dispense', async () => {
    vi.mocked(useGlassesStore().dispense).mockResolvedValue('sent')
    await useDeleteGlasses(1234).deleteGlasses('DISPENSED')
    expect(toastQueue.value).toEqual([
      { color: 'info', text: 'Successfully dispensed glasses with SKU 1234' },
    ])
  })

  it('warns that a queued dispense uploads later', async () => {
    const onSuccess = vi.fn()
    vi.mocked(useGlassesStore().dispense).mockResolvedValue('queued')
    await useDeleteGlasses(1234, onSuccess).deleteGlasses('DISPENSED')
    expect(toastQueue.value).toEqual([
      { color: 'warning', text: "Glasses with SKU 1234 will be dispensed when you're back online" },
    ])
    expect(onSuccess).toHaveBeenCalled()
  })

  it('warns that a queued undo uploads later', async () => {
    vi.mocked(useGlassesStore().undispense).mockResolvedValue('queued')
    const [glasses] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })
    await useUndoDispension().undo(glasses)
    expect(toastQueue.value).toEqual([
      { color: 'warning', text: expect.stringContaining('reverted as soon as') },
    ])
  })
})
