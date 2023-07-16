import { defineStore, acceptHMRUpdate } from 'pinia'
import { useRootStore } from './root'
import { useAxios } from '@/lib/axios'

export const useTableStore = defineStore('table', () => {
  const axiosInstance = useAxios()
  const totalGlassesCount = ref(0)
  const hasGlassesLoaded = computed(() => {
    return totalGlassesCount.value > 0
  })
  async function loadItems(options: any, filterString: string | null) {
    const rootStore = useRootStore()
    const sortString = options.sortBy[0].key + ',' + options.sortBy[0].order
    const params: any = { size: options.itemsPerPage, page: options.page - 1, sort: sortString }
    if (filterString != null && filterString !== '') params.search = filterString

    const response = await axiosInstance.get(`/api/glasses/${rootStore.reimsSite}`, { params })

    totalGlassesCount.value = response.data.totalElements
    return response.data.glasses
  }
  return {
    totalGlassesCount,
    hasGlassesLoaded,
    loadItems,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTableStore, import.meta.hot))
}
