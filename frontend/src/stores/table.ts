import { defineStore, acceptHMRUpdate } from 'pinia'
import { useRootStore } from './root'
import { useAxios } from '@/lib/axios'
import { TableSortBy } from '@/model/ReimsModel'

type Params = {
  size: number
  page: number
  sort: string
  search?: string
}

export const useTableStore = defineStore('table', () => {
  const axiosInstance = useAxios()
  const totalGlassesCount = ref(0)
  const hasGlassesLoaded = computed(() => {
    return totalGlassesCount.value > 0
  })
  async function loadItems(
    currentPage: number,
    itemsPerPage: number,
    filterString: string | null,
    sortBy: TableSortBy,
  ) {
    const rootStore = useRootStore()
    const sortString = sortBy.key + ',' + sortBy.order

    const params: Params = { size: itemsPerPage, page: currentPage - 1, sort: sortString }
    if (filterString != null && filterString !== '') params.search = filterString

    const response = await axiosInstance.get(`/api/glasses/${rootStore.reimsSite}`, { params })

    totalGlassesCount.value = response.data.totalItems
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
