import { useIntervalFn } from '@vueuse/core'

// Workbox's background sync queue (workbox-background-sync QueueDb), only read here
const DB_NAME = 'workbox-background-sync'
const STORE_NAME = 'requests'
const COUNTED_QUEUES = ['reimsDispenseQueue', 'reimsEditQueue']

interface QueueEntry {
  queueName: string
}

function readQueue(): Promise<QueueEntry[]> {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve([])
    const request = indexedDB.open(DB_NAME)
    // the service worker creates the DB, don't create an empty one
    request.onupgradeneeded = () => request.transaction?.abort()
    request.onerror = () => resolve([])
    request.onsuccess = () => {
      const db = request.result
      try {
        const getAll = db.transaction(STORE_NAME).objectStore(STORE_NAME).getAll()
        getAll.onsuccess = () => resolve(getAll.result)
        getAll.onerror = () => resolve([])
      } catch {
        resolve([])
      } finally {
        // closes after the read, an open connection would block Workbox from upgrading the DB
        db.close()
      }
    }
  })
}

// Chrome gives up after 3 failed syncs and Workbox only registers a new one when a request is queued
async function retrySync(queueNames: string[]) {
  const registration = await navigator.serviceWorker?.getRegistration()
  const sync = (registration as { sync?: { register(tag: string): Promise<void> } } | undefined)
    ?.sync
  for (const name of queueNames) {
    await sync?.register(`workbox-background-sync:${name}`).catch(() => {})
  }
}

export const usePendingChanges = () => {
  const pendingCount = ref(0)

  useIntervalFn(
    async () => {
      const entries = await readQueue()
      pendingCount.value = entries.filter((e) => COUNTED_QUEUES.includes(e.queueName)).length
      if (entries.length > 0 && navigator.onLine) {
        await retrySync([...new Set(entries.map((e) => e.queueName))])
      }
    },
    10 * 1000,
    { immediateCallback: true },
  )

  return { pendingCount }
}
