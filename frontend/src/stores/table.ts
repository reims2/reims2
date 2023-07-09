import { defineStore } from 'pinia'
import axios from 'axios'

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
      const sortString = options.sortBy[0] + ',' + (options.sortDesc[0] ? 'desc' : 'asc')
      const params: any = { size: options.itemsPerPage, page: options.page - 1, sort: sortString }
      if (filterString != null && filterString !== '') params.search = filterString
      const data = (await axios.get('/api/glasses', { params })) as any
      this.totalGlassesCount = data.totalElements
      return data.glasses
    },
  },
})
