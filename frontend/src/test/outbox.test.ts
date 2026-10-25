import 'fake-indexeddb/auto'
import * as outbox from '@/lib/outbox'
import { OutboxEntry } from '@/lib/outbox'
import { ReimsAxiosError } from '@/lib/axios'
import { toastQueue } from '@/composables/toast'
import { SearchLog } from '@/model/GlassesModel'
import { stubWebLocks } from './util'

stubWebLocks()

const dispense = (sku: number): OutboxEntry => ({
  kind: 'dispense',
  site: 'sa',
  createdAt: Date.now(),
  payload: { sku, reason: 'DISPENSED' },
})
const searchLog = (resultCount: number): OutboxEntry => ({
  kind: 'searchLog',
  site: 'sa',
  createdAt: Date.now(),
  payload: { request: { resultCount } as SearchLog },
})
const label = (e: OutboxEntry) =>
  e.kind === 'dispense' ? e.payload.sku : e.kind === 'searchLog' && e.payload.request.resultCount

const networkError = () => new ReimsAxiosError('Network error', true)
const serverError = () => new ReimsAxiosError('Server error', false, true, null, 502)
const unauthorized = () => new ReimsAxiosError('Unauthorized', false, false, null, 401)
const clientError = (status: number) =>
  new ReimsAxiosError(`Error ${status}`, false, false, 'nope', status)

// sends everything and records the order, failing entries with the given errors
function sender(errors: Record<number, Error> = {}) {
  const sent: unknown[] = []
  const send = vi.fn(async (e: OutboxEntry) => {
    const error = errors[label(e) as number]
    if (error) throw error
    sent.push(label(e))
  })
  return { sent, send }
}

describe('outbox', () => {
  beforeEach(async () => {
    await outbox.flush(async () => {})
    toastQueue.value = []
  })

  it('sends glasses changes oldest first', async () => {
    for (const sku of [1, 2, 3]) await outbox.add(dispense(sku))
    const { sent, send } = sender()
    await outbox.flush(send)
    expect(sent).toEqual([1, 2, 3])
    expect(await outbox.count()).toBe(0)
  })

  it.each([
    ['no response', networkError()],
    ['a 5xx', serverError()],
    ['a 401', unauthorized()],
  ])('keeps the entry and stops on %s', async (_, error) => {
    for (const sku of [1, 2, 3]) await outbox.add(dispense(sku))
    const { sent, send } = sender({ 2: error })
    await outbox.flush(send)
    expect(sent).toEqual([1])
    expect(await outbox.count()).toBe(2)
    expect(toastQueue.value).toEqual([])
  })

  it('drops an entry on another 4xx and tells the user', async () => {
    for (const sku of [1, 2, 3]) await outbox.add(dispense(sku))
    const { sent, send } = sender({ 2: clientError(400) })
    await outbox.flush(send)
    expect(sent).toEqual([1, 3])
    expect(await outbox.count()).toBe(0)
    expect(toastQueue.value).toEqual([
      { color: 'error', text: expect.stringContaining('Dispensing SKU 0002') },
    ])
    expect(toastQueue.value[0].text).toContain('nope')
  })

  it('explains a 404 on dispense', async () => {
    await outbox.add(dispense(7))
    await outbox.flush(sender({ 7: clientError(404) }).send)
    expect(toastQueue.value).toEqual([
      { color: 'warning', text: 'SKU 0007 not found on server, was it already dispensed?' },
    ])
  })

  it('sends search logs in their own pass', async () => {
    await outbox.add(dispense(1))
    await outbox.add(searchLog(10))
    await outbox.add(searchLog(11))
    const { sent, send } = sender({ 1: networkError() })
    await outbox.flush(send)
    expect(sent).toEqual([10, 11])
    expect(await outbox.count()).toBe(1)
  })

  it('skips search logs after a 401', async () => {
    await outbox.add(dispense(1))
    await outbox.add(searchLog(10))
    const { sent, send } = sender({ 1: unauthorized() })
    await outbox.flush(send)
    expect(sent).toEqual([])
  })

  it('counts glasses changes only', async () => {
    await outbox.add(searchLog(10))
    await outbox.add(dispense(1))
    expect(await outbox.count()).toBe(1)
  })

  it('discards glasses changes older than 30 days, but not search logs', async () => {
    const old = Date.now() - 31 * 24 * 60 * 60 * 1000
    await outbox.add({ ...dispense(1), createdAt: old })
    await outbox.add({ ...searchLog(10), createdAt: old })
    await outbox.add({ ...dispense(2), createdAt: Date.now() })
    const { sent, send } = sender()
    await outbox.flush(send)
    expect(sent).toEqual([2, 10])
    expect(toastQueue.value).toEqual([
      { color: 'error', text: expect.stringContaining('Dispensing SKU 0001 was not uploaded') },
    ])
  })
})
