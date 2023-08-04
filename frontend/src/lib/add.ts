import { sanitizeEyeValues, clearObjectProperties } from '@/lib/util'

import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'

import { DisplayedEye, Glasses, GlassesMeta, SanitizedGlassesInput } from '@/model/GlassesModel'

import { useToast } from 'vue-toastification'
import { ReimsAxiosError } from '@/lib/axios'

export const useAddGlasses = (onSuccessFn?: () => void) => {
  const toast = useToast()

  const glassesStore = useGlassesStore()
  const rootStore = useRootStore()
  const allGlasses = computed(() => glassesStore.allGlasses)

  const loading = ref(false)
  const glassesMeta = ref<Partial<GlassesMeta>>({})
  const odEye = ref<DisplayedEye>({ axis: '', cylinder: '', sphere: '', add: '' })
  const osEye = ref<DisplayedEye>({ axis: '', cylinder: '', sphere: '', add: '' })
  const syncEyes = ref(true)

  const lastAdded = computed(() => {
    return rootStore.lastAddedSkus
      .map((sku) => allGlasses.value.find((g) => g.sku === sku))
      .filter((itm) => itm != null) as Glasses[]
  })
  const freeSlots = computed(() => 5000 - allGlasses.value.length)
  const isMultifocal = computed(() => glassesMeta.value.glassesType === 'multifocal')

  watch(
    () => odEye.value.add,
    (newVal) => {
      if (syncEyes.value) osEye.value.add = newVal
    },
  )
  watch(
    () => osEye.value.add,
    (newVal, oldVal) => {
      if (newVal !== oldVal && !oldVal) syncEyes.value = false
    },
  )

  watch(allGlasses, () => {
    // Filter out deleted glasses
    rootStore.lastAddedSkus = rootStore.lastAddedSkus.filter((sku) =>
      allGlasses.value.find((g) => g.sku === sku),
    )
  })

  async function submit() {
    if (loading.value) return
    if (
      !glassesMeta.value.glassesType ||
      !glassesMeta.value.appearance ||
      !glassesMeta.value.glassesSize
    ) {
      toast.error('Please fill in all required fields')
      return
    }

    const requestGlasses: SanitizedGlassesInput = {
      glassesType: glassesMeta.value.glassesType,
      glassesSize: glassesMeta.value.glassesSize,
      appearance: glassesMeta.value.appearance,
      od: sanitizeEyeValues(odEye.value),
      os: sanitizeEyeValues(osEye.value),
    }
    loading.value = true
    try {
      const newGlasses = await glassesStore.addGlasses(requestGlasses)
      rootStore.lastAddedSkus.unshift(newGlasses.sku)
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
    clearObjectProperties(odEye.value)
    clearObjectProperties(osEye.value)
    glassesMeta.value = {}
    syncEyes.value = true
  }

  return {
    loading,
    glassesMeta,
    odEye,
    osEye,
    isMultifocal,
    lastAdded,
    freeSlots,
    submit,
    reset,
  }
}
