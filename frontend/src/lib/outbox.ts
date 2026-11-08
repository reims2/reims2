import { useLocalStorage } from '@vueuse/core'
import { Glasses } from '@/model/GlassesModel'
import { DeletionReason } from '@/model/ReimsModel'
import { ApiError } from '@/lib/api'
import { useToast } from '@/composables/toast'
import { deepCopyGlasses } from '@/util/glasses-utils'
import { getAndConvertSku } from '@/util/format-glasses'

export type Change = { glasses: Glasses } & (
  { kind: 'dispense'; reason: DeletionReason } | { kind: 'undispense' | 'edit' }
)
export type OutboxEntry = Change & { createdAt: number }

// shared with other tabs through storage events
export const queue = useLocalStorage<OutboxEntry[]>('reims-outbox', [])

export function add(change: Change) {
  queue.value.push({ ...change, glasses: deepCopyGlasses(change.glasses), createdAt: Date.now() })
}

// an older change would overwrite what happened on site since
const MAX_AGE = 30 * 24 * 60 * 60 * 1000

async function attempt(
  entry: OutboxEntry,
  send: (entry: OutboxEntry) => Promise<unknown>,
): Promise<'sent' | 'dropped' | 'kept'> {
  const toast = useToast()
  const label = `${entry.kind} of SKU ${getAndConvertSku(entry.glasses)}`
  if (Date.now() - entry.createdAt > MAX_AGE) {
    toast.error(`A queued ${label} older than 30 days was discarded, please check it`)
    return 'dropped'
  }
  try {
    await send(entry)
    return 'sent'
  } catch (error) {
    if (!(error instanceof ApiError) || error.isNetwork || error.isServerSide) return 'kept'
    if (error.statusCode === 401) return 'kept'
    toast.error(`A queued ${label} was rejected by the server (${error.message}), please check it`)
    return 'dropped'
  }
}

/** Sends entries oldest first and stops at the first one that stays queued. True if any was dropped. */
export async function flush(send: (entry: OutboxEntry) => Promise<unknown>): Promise<boolean> {
  let dropped = false
  // one tab uploads, and a slow run never overlaps the next one
  await navigator.locks.request('reims-outbox', { ifAvailable: true }, async (lock) => {
    if (!lock) return
    while (queue.value.length > 0) {
      const result = await attempt(queue.value[0], send)
      if (result === 'kept') return
      if (result === 'dropped') dropped = true
      queue.value = queue.value.slice(1)
    }
  })
  return dropped
}
