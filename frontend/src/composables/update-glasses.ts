import { useOnline } from '@vueuse/core'
import { useGlassesStore } from '@/stores/glasses'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

export const useUpdatesGlassesInterval = () => {
  const glassesStore = useGlassesStore()
  const toast = useToast()
  const isOnline = useOnline()
  const interval = ref<NodeJS.Timer | null>(null)

  onMounted(() => {
    interval.value = setInterval(() => updateGlasses(), 60 * 1000)
    updateGlasses()
  })
  onUnmounted(() => {
    if (interval.value) clearInterval(interval.value)
  })

  watch(isOnline, (nowOnline, previouslyOnline) => {
    if (!previouslyOnline && nowOnline) updateGlasses()
  })

  async function updateGlasses() {
    try {
      await glassesStore.loadGlassesIfChanged()
    } catch (error) {
      if (!glassesStore.lastRefresh) {
        toast.error(
          `Could not load glasses database, please reload or retry later (${error.message})`,
        )
      } else if (dayjs().diff(glassesStore.lastRefresh) > 3 * 24 * 60 * 60 * 1000) {
        // if the last successful update is more than three day ago, mark DB as outdated
        glassesStore.isOutdated = true
      }
      // else just fail silently because there's still a recent enough version of the DB cached
      console.warn('DB update failed', error)
    }
  }
}
