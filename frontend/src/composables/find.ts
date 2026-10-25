import { GlassesInput, GlassesSearch, GlassesType, SanitizedEyeSearch } from '@/model/GlassesModel'
import { sanitizeEyeValues } from '@/util/eye-utils'
import { MaybeRefOrGetter } from 'vue'
import calculateAllPhilscore from '@/lib/philscore'
import calculateAllBlurscore from '@/lib/blurscore'
import interleave, { MatchResult } from '@/lib/interleave'
import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'
import { useDeleteGlasses, useUndoDispension } from '@/composables/edit'

export const useFindGlasses = (
  glasses: Ref<GlassesInput>,
  highTolerance: MaybeRefOrGetter<boolean>,
  isValid: MaybeRefOrGetter<boolean>,
) => {
  const matches = ref<null | MatchResult[]>(null)
  const glassesStore = useGlassesStore()
  const rootStore = useRootStore()
  const allGlasses = computed(() => glassesStore.allGlasses)
  const reimsSite = computed(() => rootStore.reimsSite)

  function startSearch(isUserSubmitted = true) {
    if (!toValue(isValid)) return
    const eyeModel: GlassesSearch = {
      glassesType: glasses.value.glassesType as GlassesType,
      os: sanitizeEyeValues(glasses.value.os) as SanitizedEyeSearch,
      od: sanitizeEyeValues(glasses.value.od) as SanitizedEyeSearch,
      highTolerance: toValue(highTolerance),
    }
    const stock = allGlasses.value
    const philscore = calculateAllPhilscore(eyeModel, stock)
    matches.value = interleave(philscore, calculateAllBlurscore(eyeModel, stock))
    if (isUserSubmitted) {
      const results = matches.value.map(({ id, algorithm }) => ({ id, algorithm }))
      // queued when offline, a server error isn't worth bothering the user with
      glassesStore.logSearch(eyeModel, philscore.length, results).catch(() => {})
    }
  }

  function reset() {
    matches.value = null
  }

  watch(
    () => [glasses, highTolerance, reimsSite],
    () => {
      reset()
    },
    { deep: true },
  )
  return {
    matches,
    startSearch,
    reset,
  }
}

// results are a snapshot, so a dispensed pair stays listed with an undo until the next search
export const useDispenseResult = (matches: Ref<MatchResult[] | null>) => {
  const dispensedIds = ref<number[]>([])
  const current = ref<MatchResult | null>(null)
  watch(matches, () => (dispensedIds.value = []))

  const { isLoading: isDispensing, deleteGlasses } = useDeleteGlasses(
    () => current.value,
    () => {
      if (current.value) dispensedIds.value.push(current.value.id)
    },
  )
  const { isLoading: isUndoing, undo: undoDispension } = useUndoDispension(() => {
    dispensedIds.value = dispensedIds.value.filter((id) => id !== current.value?.id)
  })
  const isLoading = computed(() => isDispensing.value || isUndoing.value)

  // shaped like a dispensed pair from the server, so the row and the undo treat it the same
  function shown(item: MatchResult): MatchResult {
    if (item.dispensed || !dispensedIds.value.includes(item.id)) return item
    const dispense = {
      previousSku: item.sku,
      dispenseReason: 'DISPENSED' as const,
      modifyDate: null,
    }
    return { ...item, sku: null, dispensed: true, dispense }
  }

  async function dispense(item: MatchResult) {
    if (isLoading.value) return
    current.value = item
    await deleteGlasses('DISPENSED')
  }

  async function undo(item: MatchResult) {
    if (isLoading.value) return
    current.value = item
    await undoDispension(shown(item))
  }

  return { shown, dispense, undo, isLoading, current }
}
