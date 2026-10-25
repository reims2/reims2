import {
  Glasses,
  GlassesInput,
  GlassesSearch,
  GlassesType,
  SanitizedEyeSearch,
} from '@/model/GlassesModel'
import { sanitizeEyeValues } from '@/util/eye-utils'
import { MaybeRefOrGetter } from 'vue'
import calculateAllPhilscore from '@/lib/philscore'
import calculateAllBlurscore from '@/lib/blurscore'
import interleave, { MatchResult } from '@/lib/interleave'
import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'

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
    const stock = allGlasses.value || ([] as Glasses[])
    const philscore = calculateAllPhilscore(eyeModel, stock)
    matches.value = interleave(philscore, calculateAllBlurscore(eyeModel, stock))
    if (isUserSubmitted) {
      const results = matches.value.map(({ id, sku, algorithm }) => ({ id, sku, algorithm }))
      // offline the service worker queues it, the page still gets the network error
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
