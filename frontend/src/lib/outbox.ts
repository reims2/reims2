import { DBSchema, IDBPDatabase, openDB } from 'idb'
import { Glasses, SearchLog } from '@/model/GlassesModel'
import { DeletionReason, ReimsSite } from '@/model/ReimsModel'
import { ReimsAxiosError } from '@/lib/axios'
import { useToast } from '@/composables/toast'
import { formatSku } from '@/util/format-glasses'

type Payloads = {
  dispense: { sku: number; reason: DeletionReason }
  undispense: { glasses: Glasses }
  edit: { glasses: Glasses }
  searchLog: { request: SearchLog }
}

export type OutboxEntry = {
  [K in keyof Payloads]: { kind: K; site: ReimsSite; createdAt: number; payload: Payloads[K] }
}[keyof Payloads]

export type SendFn = (entry: OutboxEntry) => Promise<unknown>

// search logs get their own store so they never wait behind glasses changes
interface OutboxSchema extends DBSchema {
  changes: { key: number; value: OutboxEntry }
  searchLogs: { key: number; value: OutboxEntry }
}
type StoreName = 'changes' | 'searchLogs'

let dbPromise: Promise<IDBPDatabase<OutboxSchema>> | null = null
function getDb() {
  dbPromise ??= openDB<OutboxSchema>('reims-outbox', 1, {
    upgrade(db) {
      db.createObjectStore('changes', { autoIncrement: true })
      db.createObjectStore('searchLogs', { autoIncrement: true })
    },
  })
  return dbPromise
}

const storeOf = (entry: OutboxEntry): StoreName =>
  entry.kind === 'searchLog' ? 'searchLogs' : 'changes'

export async function add(entry: OutboxEntry) {
  // a JSON copy, IndexedDB can't clone Vue proxies
  await (await getDb()).add(storeOf(entry), JSON.parse(JSON.stringify(entry)))
}

/** Waiting glasses changes of all sites, without search logs */
export async function count() {
  return (await getDb()).count('changes')
}

type Outcome = 'sent' | 'dropped' | 'kept' | 'unauthorized'

// an older glasses change would overwrite what happened on site since
const MAX_CHANGE_AGE = 30 * 24 * 60 * 60 * 1000

async function attempt(entry: OutboxEntry, send: SendFn): Promise<Outcome> {
  if (entry.kind !== 'searchLog' && Date.now() - entry.createdAt > MAX_CHANGE_AGE) {
    useToast().error(`${describe(entry)} was not uploaded within 30 days and was discarded`)
    return 'dropped'
  }
  try {
    await send(entry)
    return 'sent'
  } catch (error) {
    if (!(error instanceof ReimsAxiosError) || error.isNetwork || error.isServerSide) return 'kept'
    if (error.statusCode === 401) return 'unauthorized'
    toastDropped(entry, error)
    return 'dropped'
  }
}

function toastDropped(entry: OutboxEntry, error: ReimsAxiosError) {
  const toast = useToast()
  if (entry.kind === 'dispense' && error.statusCode === 404) {
    const action = entry.payload.reason === 'DISPENSED' ? 'dispensed' : 'deleted'
    toast.warning(
      `SKU ${formatSku(entry.payload.sku)} not found on server, was it already ${action}?`,
    )
    return
  }
  toast.error(
    `${describe(entry)} could not be uploaded (${error.apiMessage ?? error.message}), please redo it`,
  )
}

function describe(entry: OutboxEntry) {
  switch (entry.kind) {
    case 'dispense':
      return `${entry.payload.reason === 'DISPENSED' ? 'Dispensing' : 'Deleting'} SKU ${formatSku(entry.payload.sku)}`
    case 'undispense':
      return `Undoing SKU ${formatSku(entry.payload.glasses.dispense?.previousSku)}`
    case 'edit':
      return `Editing SKU ${formatSku(entry.payload.glasses.sku)}`
    case 'searchLog':
      return 'A search log'
  }
}

/** Sends entries oldest first and stops at the first one that stays queued */
async function drain(store: StoreName, send: SendFn): Promise<Outcome | null> {
  const db = await getDb()
  for (;;) {
    const cursor = await db.transaction(store).store.openCursor()
    if (!cursor) return null
    const { key, value } = cursor
    const outcome = await attempt(value, send)
    if (outcome === 'kept' || outcome === 'unauthorized') return outcome
    await db.delete(store, key)
  }
}

export async function flush(send: SendFn) {
  // one tab uploads, and a slow run never overlaps the next one
  await navigator.locks.request('reims-outbox', { ifAvailable: true }, async (lock) => {
    if (!lock) return
    if ((await drain('changes', send)) === 'unauthorized') return
    await drain('searchLogs', send)
  })
}
