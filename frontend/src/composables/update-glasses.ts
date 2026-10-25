import { useEventListener, useIntervalFn, useNow, useOnline, watchThrottled } from '@vueuse/core'
import { useGlassesStore } from '@/stores/glasses'
import { useToast } from '@/composables/toast'
import dayjs from 'dayjs'

export const useUpdatesGlassesInterval = () => {
  const glassesStore = useGlassesStore()
  const toast = useToast()
  const isOnline = useOnline()
  const now = useNow({ scheduler: (cb) => useIntervalFn(cb, 15 * 1000) })
  const lastRefresh = computed(() => glassesStore.lastRefresh)

  onMounted(() => {
    updateGlasses(true)
  })

  useIntervalFn(uploadPending, 10 * 1000)
  useEventListener('online', uploadPending)

  watchThrottled(
    [isOnline, now],
    () => {
      if (dayjs(now.value).diff(lastRefresh.value, 'minute') >= 3) {
        updateGlasses()
      }
    },
    { throttle: 15000 },
  )

  async function uploadPending() {
    try {
      await glassesStore.uploadPending()
    } catch (error) {
      console.warn('Upload of pending changes failed', error)
    }
  }

  async function updateGlasses(firstLoad = false) {
    await uploadPending()
    try {
      if (firstLoad) await glassesStore.loadGlasses()
      else await glassesStore.loadGlassesIfChanged()
    } catch (error) {
      if (!glassesStore.hasGlassesLoaded) {
        toast.error(
          `Could not load glasses database, please retry later (${(error as Error).message})`,
        )
      } else if (dayjs().diff(glassesStore.lastRefresh, 'day') > 3) {
        // if the last successful update is longer ago, mark DB as outdated
        glassesStore.isOutdated = true
      }
      // else just fail silently because there's still a recent enough version of the DB cached
      console.warn('DB update failed', error)
    }
  }
}
