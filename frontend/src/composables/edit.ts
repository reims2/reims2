import { useGlassesStore } from '@/stores/glasses'

import { Glasses } from '@/model/GlassesModel'

import { useToast } from 'vue-toastification'
import { ReimsAxiosError } from '@/lib/axios'
import { MaybeRefOrGetter } from 'vue'
import { DeletionReason } from '@/model/ReimsModel'
import dayjs from 'dayjs'
import { useIntervalFn } from '@vueuse/core'
import { formatSku } from '@/util/format-glasses'

type GlassesWithKey = Glasses & { key?: string }

export const useEditGlasses = (
  selected: MaybeRefOrGetter<GlassesWithKey | null>,
  onDeletedFn?: () => void,
) => {
  const skuValue = computed(() => toValue(selected)?.sku ?? null)

  const {
    lastDispensed,
    isLoading: isLastDispensedLoading,
    updateLastDispensed,
  } = useLastDispensed()

  const { isLoading: isDeletionLoading, deleteGlasses: submitDeletion } = useDeleteGlasses(
    skuValue,
    () => {
      updateLastDispensed()
      onDeletedFn?.()
    },
  )

  const { isLoading: isUndoLoading, undo: undoDispension } = useUndoDispension(() => {
    updateLastDispensed()
  })

  function submitDispension() {
    submitDeletion('DISPENSED')
  }

  const isLoading = computed(() => isUndoLoading.value || isDeletionLoading.value)
  return {
    isLoading,
    lastDispensed,
    isLastDispensedLoading,
    submitDispension,
    submitDeletion,
    undoDispension,
  }
}

export const useLastDispensed = () => {
  const glassesStore = useGlassesStore()
  const lastDispensed = ref<Glasses[]>([])
  const isLoading = ref(false)

  const updateLastDispensed = async () => {
    if (isLoading.value) return
    isLoading.value = true
    try {
      const glasses = await glassesStore.getDispensedGlasses(dayjs().subtract(3, 'days'), dayjs())
      if (!glasses || !glasses.length) lastDispensed.value = []
      else {
        lastDispensed.value = glasses
          .sort((a, b) => {
            if (!a.dispense?.modifyDate) return 1
            if (!b.dispense?.modifyDate) return -1
            if (a.dispense.modifyDate > b.dispense.modifyDate) return -1
            return 1
          })
          .slice(0, 3)
      }
    } finally {
      isLoading.value = false
    }
  }

  watch(
    () => glassesStore.allGlassesHash,
    () => {
      updateLastDispensed()
    },
  )

  // additional interval, but shoudn't really be required due to watching for allGlassesHash above
  const { pause, resume } = useIntervalFn(updateLastDispensed, 1000 * 60 * 10)
  onActivated(() => {
    resume()
    updateLastDispensed()
  })
  onDeactivated(() => {
    pause()
  })

  return {
    lastDispensed,
    isLoading,
    updateLastDispensed,
  }
}

export const useUndoDispension = (onSuccessFn?: () => void) => {
  const toast = useToast()
  const isLoading = ref(false)
  const glassesStore = useGlassesStore()

  async function undo(glassesInput: MaybeRefOrGetter<Glasses>): Promise<void> {
    const glasses = toValue(glassesInput)
    if (isLoading.value || !glasses) return
    isLoading.value = true
    try {
      await glassesStore.undispense(glasses)
    } catch (error) {
      if (error instanceof ReimsAxiosError) {
        if (error.statusCode === 400) {
          toast.error(
            `Reverting is not possible here, please readd glasses manually (Error: ${error.apiMessage}).`,
          )
        } else if (error.isServerSide || error.isNetwork) {
          toast.warning(
            "Network or server error. Dispension/deletion will be automatically reverted as soon as you're back online.",
          )
          onSuccessFn?.()
        }
      } else {
        toast.error(
          `Could not undo dispension/deletion of glasses, please retry (${error.message}).`,
        )
      }
      return
    } finally {
      isLoading.value = false
    }

    toast.info(
      `Reverted dispension/deletion of SKU ${formatSku(glasses.dispense?.previousSku)} successfully`,
    )
    onSuccessFn?.()
  }
  return {
    isLoading,
    undo,
  }
}

export const useDeleteGlasses = (
  skuInput: MaybeRefOrGetter<number | null>,
  onSuccessFn?: () => void,
) => {
  const isLoading = ref(false)
  const glassesStore = useGlassesStore()

  const toast = useToast()

  async function deleteGlasses(reason: DeletionReason | null): Promise<void> {
    const sku = toValue(skuInput)
    if (isLoading.value || !sku) return
    // show user the correct action string, even though it's the same in the backend
    const actionString = reason === 'DISPENSED' ? 'dispense' : 'delete'
    isLoading.value = true
    try {
      await glassesStore.dispense(sku, reason ?? 'OTHER')
    } catch (error) {
      if (error instanceof ReimsAxiosError) {
        if (error.statusCode === 404) {
          toast.warning(
            `SKU ${formatSku(sku)} not found on server, was it already ${actionString}d?`,
          )
        } else if (error.isServerSide) {
          toast.error(
            `Could not ${actionString} glasses. Please report this to the REIMS2 developers (Error ${error.apiMessage})`,
          )
        } else if (error.isNetwork) {
          glassesStore.deleteOfflineGlasses(sku)
          toast.warning(
            `Glasses with SKU ${formatSku(sku)} will be ${actionString}d when you're back online`,
          )
          onSuccessFn?.()
          return
        }
      } else {
        toast.error(`Could not ${actionString} glasses, please retry (${error.message})`)
      }
      return
    } finally {
      isLoading.value = false
    }

    toast.info(`Successfully ${actionString}d glasses with SKU ${formatSku(sku)}`)
    onSuccessFn?.()
  }
  return {
    isLoading,
    deleteGlasses,
  }
}
