import { useGlassesStore } from '@/stores/glasses'

import { Glasses } from '@/model/GlassesModel'

import { useToast } from '@/composables/toast'
import { ReimsAxiosError } from '@/lib/axios'
import { DeletionReason } from '@/model/ReimsModel'
import dayjs from 'dayjs'
import { useIntervalFn } from '@vueuse/core'
import { formatSku } from '@/util/format-glasses'

export const useEditGlasses = (selected: Ref<Glasses | null>, onDeletedFn?: () => void) => {
  const {
    lastDispensed,
    isLoading: isLastDispensedLoading,
    updateLastDispensed,
  } = useLastDispensed()

  const { isLoading: isDeletionLoading, deleteGlasses } = useDeleteGlasses(() => {
    updateLastDispensed()
    onDeletedFn?.()
  })

  const { isLoading: isUndoLoading, undo: undoDispension } = useUndoDispension(() => {
    updateLastDispensed()
  })

  function submitDeletion(reason: DeletionReason) {
    if (selected.value) deleteGlasses(selected.value, reason)
  }

  const isLoading = computed(() => isUndoLoading.value || isDeletionLoading.value)
  return {
    isLoading,
    lastDispensed,
    isLastDispensedLoading,
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
      lastDispensed.value = glasses
        .sort((a, b) => {
          if (!a.dispense?.modifyDate) return 1
          if (!b.dispense?.modifyDate) return -1
          if (a.dispense.modifyDate > b.dispense.modifyDate) return -1
          return 1
        })
        .slice(0, 5)
    } finally {
      isLoading.value = false
    }
  }

  const isActive = ref(true)
  watch(
    () => glassesStore.allGlassesHash,
    () => {
      if (isActive.value) updateLastDispensed()
    },
  )

  // additional interval, but shoudn't really be required due to watching for allGlassesHash above
  const { pause, resume } = useIntervalFn(updateLastDispensed, 1000 * 60 * 10)
  onActivated(() => {
    isActive.value = true
    resume()
    updateLastDispensed()
  })
  onDeactivated(() => {
    isActive.value = false
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

  async function undo(glasses: Glasses): Promise<void> {
    if (isLoading.value) return
    isLoading.value = true
    let result
    try {
      result = await glassesStore.undispense(glasses)
    } catch (error) {
      if (error instanceof ReimsAxiosError && error.statusCode === 400) {
        toast.error(
          `Reverting is not possible here, please readd glasses manually (Error: ${error.message}).`,
        )
      } else {
        toast.error(
          `Could not undo dispension/deletion of glasses, please retry (${(error as Error).message}).`,
        )
      }
      return
    } finally {
      isLoading.value = false
    }

    if (result === 'queued') {
      toast.warning(
        "Network or server error. Dispension/deletion will be automatically reverted as soon as you're back online.",
      )
    } else {
      toast.info(
        `Reverted dispension/deletion of SKU ${formatSku(glasses.dispense?.previousSku)} successfully`,
      )
    }
    onSuccessFn?.()
  }
  return {
    isLoading,
    undo,
  }
}

export const useDeleteGlasses = (onSuccessFn?: () => void) => {
  const isLoading = ref(false)
  const glassesStore = useGlassesStore()

  const toast = useToast()

  async function deleteGlasses(glasses: Glasses, reason: DeletionReason): Promise<void> {
    if (isLoading.value) return
    const sku = glasses.sku
    // show user the correct action string, even though it's the same in the backend
    const actionString = reason === 'DISPENSED' ? 'dispense' : 'delete'
    isLoading.value = true
    let result
    try {
      result = await glassesStore.dispense(glasses, reason)
    } catch (error) {
      if (error instanceof ReimsAxiosError && error.statusCode === 404) {
        toast.warning(`SKU ${formatSku(sku)} not found on server.`)
      } else if (error instanceof ReimsAxiosError && error.isServerSide) {
        toast.error(
          `Could not ${actionString} glasses because of a server error. Please retry later (Error ${error.statusCode})`,
        )
      } else {
        toast.error(`Could not ${actionString} glasses, please retry (${(error as Error).message})`)
      }
      return
    } finally {
      isLoading.value = false
    }

    if (result === 'queued') {
      toast.warning(
        `Glasses with SKU ${formatSku(sku)} will be ${actionString}d when you're back online`,
      )
    } else {
      toast.info(`Successfully ${actionString}d glasses with SKU ${formatSku(sku)}`)
    }
    onSuccessFn?.()
  }
  return {
    isLoading,
    deleteGlasses,
  }
}
