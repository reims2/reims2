import { defineStore, acceptHMRUpdate } from 'pinia'
import { ReimsSite } from '@/model/ReimsModel'
import { reimsSiteMap } from '@/util/util'

export const useRootStore = defineStore(
  'root',
  () => {
    const isDev = import.meta.env.VITE_PVH_DEBUG === 'true'
    const reimsSite = ref('sa' as ReimsSite)
    const version: string | null = import.meta.env.VITE_GIT_VERSION || null
    const lastAddedSkus = ref([] as number[])

    const reimsSiteName = computed(() => reimsSiteMap[reimsSite.value])
    return {
      isDev,
      reimsSite,
      reimsSiteName,
      version,
      lastAddedSkus,
    }
  },
  {
    persist: {
      pick: ['reimsSite'],
    },
  },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRootStore, import.meta.hot))
}
