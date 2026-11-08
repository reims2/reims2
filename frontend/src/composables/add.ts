import { sanitizeEyeValues } from '@/util/eye-utils'

import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'

import { GlassesInput, SanitizedGlassesInput } from '@/model/GlassesModel'

import { useToast } from '@/composables/toast'
import { ApiError } from '@/lib/api'

export const useAddGlasses = (glasses: Ref<GlassesInput>, onSuccessFn?: () => void) => {
  const toast = useToast()

  const glassesStore = useGlassesStore()
  const rootStore = useRootStore()

  const loading = ref(false)

  const bySku = computed(() => new Map(glassesStore.allGlasses.map((g) => [g.sku, g])))
  const lastAdded = computed(() =>
    rootStore.lastAddedSkus.map((sku) => bySku.value.get(sku)).filter((g) => g != null),
  )
  // matches the SKU range per location in the backend's LocationEnum
  const skusPerLocation = 5000
  const freeSlots = computed(() => skusPerLocation - glassesStore.allGlasses.length)

  watch(bySku, (glasses) => {
    // Filter out deleted glasses
    rootStore.lastAddedSkus = rootStore.lastAddedSkus.filter((sku) => glasses.has(sku))
  })

  async function submit() {
    if (loading.value) return
    if (!glasses.value.glassesType || !glasses.value.appearance || !glasses.value.glassesSize) {
      toast.error('Please fill in all required fields')
      return
    }

    const requestGlasses: SanitizedGlassesInput = {
      glassesType: glasses.value.glassesType,
      glassesSize: glasses.value.glassesSize,
      appearance: glasses.value.appearance,
      od: sanitizeEyeValues(glasses.value.od),
      os: sanitizeEyeValues(glasses.value.os),
    }
    loading.value = true
    try {
      const newGlasses = await glassesStore.addGlasses(requestGlasses)
      if (newGlasses.sku != null) rootStore.lastAddedSkus.unshift(newGlasses.sku)
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 409) {
        // no free skus left.
        toast.error(error.message)
      } else {
        toast.error(`Could not add glasses, please retry (${(error as Error).message})`)
      }
      return
    } finally {
      loading.value = false
    }
    onSuccessFn?.()
  }

  return {
    loading,
    lastAdded,
    freeSlots,
    submit,
  }
}
