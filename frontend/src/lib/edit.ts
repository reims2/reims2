import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'

import { Glasses } from '@/model/GlassesModel'

import { useToast } from 'vue-toastification'
import { ReimsAxiosError } from '@/lib/axios'
import { MaybeRefOrGetter } from 'vue'
import { DeletionReason } from '@/model/ReimsModel'

type GlassesWithKey = Glasses & { key?: string }

export const useEditGlasses = (
  selected: MaybeRefOrGetter<GlassesWithKey | null>,
  onDeletedFn?: () => void,
) => {
  const toast = useToast()

  const glassesStore = useGlassesStore()
  const rootStore = useRootStore()

  const isLoading = ref(false)
  const snackbarMessage = ref('')
  const lastDispensed = computed(() => rootStore.lastDispensedGlasses.slice(0, 3))

  onDeactivated(() => {
    // reset snackbar
    snackbarMessage.value = ''
  })

  async function submitDispension() {
    await submitDeletion('DISPENSED')
  }

  async function submitDeletion(reason: DeletionReason): Promise<void> {
    if (isLoading.value) return
    // copy object because the computed `selected` property will get null when it's dispensed
    const toDispense = toValue(selected)
    if (!toDispense) return
    // do dispension
    snackbarMessage.value = ''
    // show user the correct action string, even though it's the same in the backend
    const actionString = reason === 'DISPENSED' ? 'dispense' : 'delete'
    isLoading.value = true
    try {
      await glassesStore.dispense(toDispense.sku, reason)
    } catch (error) {
      if (error instanceof ReimsAxiosError) {
        if (error.statusCode === 404) {
          toast.warning(
            `SKU ${toDispense.sku} not found on server, was it already ${actionString}d?`,
          )
        } else if (error.isServerSide) {
          toast.error(
            `Could not ${actionString} glasses. Please report this to the REIMS2 developers (Error ${error.apiMessage})`,
          )
        } else if (error.isNetwork) {
          snackbarMessage.value = `Glasses with SKU ${toDispense.sku} will be ${actionString}d when you're back online`
          glassesStore.deleteOfflineGlasses(toDispense.sku)
          rootStore.lastDispensedGlasses.unshift(toDispense)
          onDeletedFn?.()

          return
        }
      } else {
        toast.error(`Could not ${actionString} glasses, please retry (${error.message})`)
      }
      return
    } finally {
      isLoading.value = false
    }
    rootStore.lastDispensedGlasses.unshift(toDispense)

    snackbarMessage.value = `Successfully ${actionString}d glasses with SKU ${toDispense.sku}`
  }

  async function undoDispension(glasses: Glasses): Promise<void> {
    isLoading.value = true
    try {
      await glassesStore.undispense(glasses)
    } catch (error) {
      if (error instanceof ReimsAxiosError) {
        if (error.statusCode === 400) {
          toast.error(
            `Reverting is not possible here, please readd glasses manually (Error: ${error.apiMessage}).`,
          )
          snackbarMessage.value = ''
        } else if (error.isServerSide || error.isNetwork) {
          toast.error(
            "Network or server error. Dispension/deletion will be automatically reverted as soon as you're back online.",
          )
          snackbarMessage.value = ''
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

    rootStore.lastDispensedGlasses = rootStore.lastDispensedGlasses.filter(
      (g) => g.sku !== glasses.sku,
    )
    snackbarMessage.value = `Reverted dispension/deletion of SKU ${glasses.sku} successfully`
    onDeletedFn?.()
  }
  return {
    isLoading,
    snackbarMessage,
    lastDispensed,
    submitDispension,
    submitDeletion,
    undoDispension,
  }
}
