import * as outbox from '@/lib/outbox'
import { Change, OutboxEntry } from '@/lib/outbox'
import { ApiError } from '@/lib/api'
import { toastQueue } from '@/composables/toast'
import { createGlassesEqualOdOs, stubWebLocks } from './util'

stubWebLocks()

const [glasses] = createGlassesEqualOdOs('single', { sphere: 1, cylinder: 0, axis: 0 })
const dispense = (sku: number): Change => ({
  kind: 'dispense',
  glasses: { ...glasses, sku },
  reason: 'DISPENSED',
})

const networkError = () => new ApiError('Network error')
const serverError = () => new ApiError('Server error', 502)
const unauthorized = () => new ApiError('Unauthorized', 401)
const clientError = (status: number) => new ApiError(`Error ${status}`, status, 'nope')

// sends everything and records the SKUs in order, failing entries with the given errors
function sender(errors: Record<number, Error> = {}) {
  const sent: (number | null)[] = []
  const send = vi.fn(async ({ glasses }: OutboxEntry) => {
    const error = errors[glasses.sku ?? NaN]
    if (error) throw error
    sent.push(glasses.sku)
  })
  return { sent, send }
}

describe('outbox', () => {
  beforeEach(() => {
    outbox.queue.value = []
    toastQueue.value = []
  })

  it('sends changes oldest first', async () => {
    for (const sku of [1, 2, 3]) outbox.add(dispense(sku))
    const { sent, send } = sender()
    expect(await outbox.flush(send)).toBe(false)
    expect(sent).toEqual([1, 2, 3])
    expect(outbox.queue.value).toEqual([])
  })

  it('stores a copy that later changes to the pair do not touch', async () => {
    const pair = reactive({ ...glasses, sku: 1 })
    outbox.add({ kind: 'edit', glasses: pair })
    pair.sku = 2
    expect(outbox.queue.value[0].glasses.sku).toBe(1)
    await nextTick()
    expect(JSON.parse(localStorage.getItem('reims-outbox')!)[0].glasses.sku).toBe(1)
  })

  it.each([
    ['no response', networkError()],
    ['a 5xx', serverError()],
    ['a 401', unauthorized()],
  ])('keeps the entry and stops on %s', async (_, error) => {
    for (const sku of [1, 2, 3]) outbox.add(dispense(sku))
    const { sent, send } = sender({ 2: error })
    expect(await outbox.flush(send)).toBe(false)
    expect(sent).toEqual([1])
    expect(outbox.queue.value).toHaveLength(2)
    expect(toastQueue.value).toEqual([])
  })

  it('drops an entry on another 4xx and tells the user', async () => {
    for (const sku of [1, 2, 3]) outbox.add(dispense(sku))
    const { sent, send } = sender({ 2: clientError(400) })
    expect(await outbox.flush(send)).toBe(true)
    expect(sent).toEqual([1, 3])
    expect(outbox.queue.value).toEqual([])
    expect(toastQueue.value).toEqual([
      {
        color: 'error',
        timeout: -1,
        text: expect.stringContaining('queued dispense of SKU 0002 was rejected'),
      },
    ])
    expect(toastQueue.value[0].text).toContain('nope')
  })

  it('discards changes older than 30 days', async () => {
    outbox.add(dispense(1))
    outbox.add(dispense(2))
    outbox.queue.value[0].createdAt = Date.now() - 31 * 24 * 60 * 60 * 1000
    const { sent, send } = sender()
    expect(await outbox.flush(send)).toBe(true)
    expect(sent).toEqual([2])
    expect(toastQueue.value).toEqual([
      {
        color: 'error',
        timeout: -1,
        text: expect.stringContaining('dispense of SKU 0001 older than 30 days'),
      },
    ])
  })
})
