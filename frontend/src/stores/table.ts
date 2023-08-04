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
  const rootStore = useRootStore()
  async function loadItems(
    currentPage: number,
    itemsPerPage: number,
    filterString: string | null,
    sortBy: TableSortBy,
  ) {
    const sortString = sortBy.key + ',' + sortBy.order

    const params: Params = { size: itemsPerPage, page: currentPage - 1, sort: sortString }
    if (filterString != null && filterString !== '') params.search = filterString

    const response = await axiosInstance.get(`/api/glasses/${rootStore.reimsSite}`, { params })

    return {
      glasses: response.data.glasses,
      totalItems: response.data.totalItems,
    }
  }
  return {
    loadItems,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTableStore, import.meta.hot))
}
