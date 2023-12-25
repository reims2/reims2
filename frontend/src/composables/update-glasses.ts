import { useNow, useOnline, watchThrottled } from '@vueuse/core'
import { useGlassesStore } from '@/stores/glasses'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

export const useUpdatesGlassesInterval = () => {
  const glassesStore = useGlassesStore()
  const toast = useToast()
  const isOnline = useOnline()
  const now = useNow()
  const lastRefresh = computed(() => glassesStore.lastRefresh)

  onMounted(() => {
    updateGlasses(true)
  })

  watchThrottled(
    [isOnline, now],
    () => {
      if (dayjs(now.value).diff(lastRefresh.value, 'minute') >= 5) {
        updateGlasses()
      }
    },
    { throttle: 10000 },
  )

  async function updateGlasses(firstLoad = false) {
    try {
      if (firstLoad) await glassesStore.loadGlasses()
      else await glassesStore.loadGlassesIfChanged()
    } catch (error) {
      if (!glassesStore.hasGlassesLoaded) {
        toast.error(`Could not load glasses database, please retry later (${error.message})`)
      } else if (dayjs().diff(glassesStore.lastRefresh, 'day') > 3) {
        // if the last successful update is longer ago, mark DB as outdated
        glassesStore.isOutdated = true
      }
      // else just fail silently because there's still a recent enough version of the DB cached
      console.warn('DB update failed', error)
    }
  }
}
