import { useTableStore } from '@/stores/table'
import { useRootStore } from '@/stores/root'
import dayjs from 'dayjs'
import { DisplayedGlasses, Glasses } from '@/model/GlassesModel'
import { useToast } from 'vue-toastification'
import { ReimsAxiosError } from '@/lib/axios'

import { TableSortBy } from '@/model/ReimsModel'
import { formatEyeValues } from '@/lib/eye-utils'
import { formatSku } from '@/lib/glasses-utils'

export const useTableData = (
  currentPage: Ref<number>,
  itemsPerPage: Ref<number>,
  sortBy: Ref<TableSortBy[]>,
  filterString?: Ref<string> | string,
) => {
  const toast = useToast()

  const tableStore = useTableStore()
  const rootStore = useRootStore()
  const reimsSite = computed(() => rootStore.reimsSite)

  const loading = ref(false)
  const items = ref([])
  const totalItems = ref(0)

  const formattedItems = computed(() => {
    return items.value.map((item: Glasses) => {
      const newItem: DisplayedGlasses = {
        glassesType: item.glassesType,
        glassesSize: item.glassesSize,
        appearance: item.appearance,
        sku: formatSku(item.sku),
        creationDate: formatDate(item.creationDate),
        od: formatEyeValues(item.od),
        os: formatEyeValues(item.os),
      }
      return newItem
    })
  })

  function formatDate(date: number) {
    return dayjs(date).format('DD.MM.YYYY')
  }

  watch(
    [reimsSite, filterString, itemsPerPage, sortBy, currentPage],
    () => {
      startLoading()
    },
    { immediate: true },
  )

  async function startLoading() {
    loading.value = true
    try {
      const result = await tableStore.loadItems(
        currentPage.value,
        itemsPerPage.value,
        toValue(filterString ?? ''),
        sortBy.value[0],
      )
      items.value = result.glasses
      totalItems.value = result.totalItems
    } catch (error) {
      if (error instanceof ReimsAxiosError && error.statusCode === 404) {
        items.value = []
      } else {
        toast.error(`Could not load table data, please retry (${error.message})`)
      }
    } finally {
      loading.value = false
    }
  }
  return {
    formattedItems,
    totalItems,
    loading,
    startLoading,
  }
}
