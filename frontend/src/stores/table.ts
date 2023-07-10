import { defineStore } from 'pinia'
import axios from 'axios'
import { useRootStore } from './root'

export const useTableStore = defineStore({
  id: 'table',
  state: () => ({
    totalGlassesCount: 0,
  }),
  getters: {
    hasGlassesLoaded: (state) => {
      return state.totalGlassesCount > 0
    },
  },
  actions: {
    async loadItems(options: any, filterString: string | null) {
      const rootStore = useRootStore()
      const sortString = options.sortBy[0].key + ',' + options.sortBy[0].order
      const params: any = { size: options.itemsPerPage, page: options.page - 1, sort: sortString }
      if (filterString != null && filterString !== '') params.search = filterString

      const response = await axios.get(`/api/glasses/${rootStore.reimsSite}`, { params })

      this.totalGlassesCount = response.data.totalElements
      return response.data.glasses
    },
  },
})
