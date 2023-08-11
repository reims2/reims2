import { useGlassesStore } from '@/stores/glasses'

import { Glasses } from '@/model/GlassesModel'

import { useToast } from 'vue-toastification'
import { ReimsAxiosError } from '@/lib/axios'
import { MaybeRefOrGetter } from 'vue'
import { DeletionReason } from '@/model/ReimsModel'
import dayjs from 'dayjs'
import { useIntervalFn } from '@vueuse/core'

type GlassesWithKey = Glasses & { key?: string }

export const useEditGlasses = (
  selected: MaybeRefOrGetter<GlassesWithKey | null>,
  onDeletedFn?: () => void,
) => {
  const skuValue = computed(() => toValue(selected)?.sku ?? null)

  const { lastDispensed, updateLastDispensed } = useLastDispensed()

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
    submitDispension,
    submitDeletion,
    undoDispension,
  }
}

export const useLastDispensed = () => {
  const glassesStore = useGlassesStore()
  const lastDispensed = ref<Glasses[]>([])

  const updateLastDispensed = async () => {
    const glasses = await glassesStore.getDispensedGlasses(
      dayjs().subtract(1, 'week'),
      dayjs().add(1, 'day'),
    )
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
  }

  useIntervalFn(updateLastDispensed, 1000 * 60 * 2)
  onActivated(() => {
    updateLastDispensed()
  })
  return {
    lastDispensed,
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

    toast.info(`Reverted dispension/deletion of SKU ${glasses.dispense?.previousSku} successfully`)
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

  async function deleteGlasses(reason: DeletionReason): Promise<void> {
    const sku = toValue(skuInput)
    if (isLoading.value || !sku) return
    // show user the correct action string, even though it's the same in the backend
    const actionString = reason === 'DISPENSED' ? 'dispense' : 'delete'
    isLoading.value = true
    try {
      await glassesStore.dispense(sku, reason)
    } catch (error) {
      if (error instanceof ReimsAxiosError) {
        if (error.statusCode === 404) {
          toast.warning(`SKU ${sku} not found on server, was it already ${actionString}d?`)
        } else if (error.isServerSide) {
          toast.error(
            `Could not ${actionString} glasses. Please report this to the REIMS2 developers (Error ${error.apiMessage})`,
          )
        } else if (error.isNetwork) {
          glassesStore.deleteOfflineGlasses(sku)
          toast.warning(`Glasses with SKU ${sku} will be ${actionString}d when you're back online`)
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

    toast.info(`Successfully ${actionString}d glasses with SKU ${sku}`)
    onSuccessFn?.()
  }
  return {
    isLoading,
    deleteGlasses,
  }
}
