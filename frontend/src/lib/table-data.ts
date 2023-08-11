import { useTableStore } from '@/stores/table'
import { useRootStore } from '@/stores/root'
import dayjs from 'dayjs'
import { DisplayedGlasses, Glasses } from '@/model/GlassesModel'
import { useToast } from 'vue-toastification'
import { ReimsAxiosError } from '@/lib/axios'

import { TableSortBy } from '@/model/ReimsModel'

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
        od: {
          sphere: formatRx(item.od.sphere),
          cylinder: formatRx(item.od.cylinder),
          axis: formatAxis(item.od.axis),
          add: formatRx(item.od.add),
        },
        os: {
          sphere: formatRx(item.os.sphere),
          cylinder: formatRx(item.os.cylinder),
          axis: formatAxis(item.os.axis),
          add: formatRx(item.os.add),
        },
      }
      return newItem
    })
  })

  function formatDate(date: number) {
    return dayjs(date).format('DD.MM.YYYY')
  }

  function formatRx(value: number | undefined) {
    if (value == null) return ''
    return (value >= 0 ? '+' : '-') + Math.abs(value).toFixed(2)
  }

  function formatAxis(value: number) {
    return value.toString().padStart(3, '0')
  }

  function formatSku(value: number) {
    return value.toString().padStart(4, '0')
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
