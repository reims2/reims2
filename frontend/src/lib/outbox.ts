import { DBSchema, IDBPDatabase, openDB } from 'idb'
import { Glasses, SearchLog } from '@/model/GlassesModel'
import { DeletionReason, ReimsSite } from '@/model/ReimsModel'
import { ReimsAxiosError } from '@/lib/axios'
import { useToast } from '@/composables/toast'

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

interface OutboxSchema extends DBSchema {
  entries: { key: number; value: OutboxEntry }
}

let dbPromise: Promise<IDBPDatabase<OutboxSchema>> | null = null
function getDb() {
  dbPromise ??= openDB<OutboxSchema>('reims-outbox', 1, {
    upgrade(db) {
      db.createObjectStore('entries', { autoIncrement: true })
    },
  })
  return dbPromise
}

export async function add(entry: OutboxEntry) {
  // a JSON copy, IndexedDB can't clone Vue proxies
  await (await getDb()).add('entries', JSON.parse(JSON.stringify(entry)))
}

/** Waiting glasses changes of all sites, without search logs */
export async function count() {
  const entries = await (await getDb()).getAll('entries')
  return entries.filter((entry) => entry.kind !== 'searchLog').length
}

// an older glasses change would overwrite what happened on site since
const MAX_CHANGE_AGE = 30 * 24 * 60 * 60 * 1000

/** Returns false if the entry stays queued */
async function attempt(entry: OutboxEntry, send: SendFn): Promise<boolean> {
  const toast = useToast()
  if (entry.kind !== 'searchLog' && Date.now() - entry.createdAt > MAX_CHANGE_AGE) {
    toast.error(`A queued ${entry.kind} older than 30 days was discarded, please check it`)
    return true
  }
  try {
    await send(entry)
  } catch (error) {
    if (!(error instanceof ReimsAxiosError) || error.isNetwork || error.isServerSide) return false
    if (error.statusCode === 401) return false
    toast.error(
      `A queued ${entry.kind} was rejected by the server (${error.apiMessage ?? error.message}), please check it`,
    )
  }
  return true
}

/** Sends entries oldest first and stops at the first one that stays queued */
export async function flush(send: SendFn) {
  // one tab uploads, and a slow run never overlaps the next one
  await navigator.locks.request('reims-outbox', { ifAvailable: true }, async (lock) => {
    if (!lock) return
    const db = await getDb()
    for (;;) {
      const cursor = await db.transaction('entries').store.openCursor()
      if (!cursor) return
      const { key, value } = cursor
      if (!(await attempt(value, send))) return
      await db.delete('entries', key)
    }
  })
}
