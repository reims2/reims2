import { sanitizeEyeValues, resetEyeInput } from '@/util/eye-utils'

import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'

import { Glasses, GlassesInput, SanitizedGlassesInput } from '@/model/GlassesModel'

import { useToast } from 'vue-toastification'
import { ReimsAxiosError } from '@/lib/axios'

export const useAddGlasses = (glasses: Ref<GlassesInput>, onSuccessFn?: () => void) => {
  const toast = useToast()

  const glassesStore = useGlassesStore()
  const rootStore = useRootStore()
  const allGlasses = computed(() => glassesStore.allGlasses)

  const loading = ref(false)
  const syncEyes = ref(true)

  const lastAdded = computed(() => {
    return rootStore.lastAddedSkus
      .map((sku) => allGlasses.value.find((g) => g.sku === sku))
      .filter((itm) => itm != null) as Glasses[]
  })
  const freeSlots = computed(() => 5000 - allGlasses.value.length)

  watch(allGlasses, () => {
    // Filter out deleted glasses
    rootStore.lastAddedSkus = rootStore.lastAddedSkus.filter((sku) =>
      allGlasses.value.find((g) => g.sku === sku),
    )
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
      if (error instanceof ReimsAxiosError && error.statusCode === 409) {
        // no free skus left.
        toast.error(error.message)
      } else {
        toast.error(`Could not add glasses, please retry (${error.message})`)
      }
      return
    } finally {
      loading.value = false
    }
    onSuccessFn?.()
  }
  function reset() {
    resetEyeInput(glasses.value.od)
    resetEyeInput(glasses.value.os)
    // TODO reset meta
    syncEyes.value = true
  }

  return {
    loading,
    lastAdded,
    freeSlots,
    submit,
    reset,
  }
}
