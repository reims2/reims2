import {
  Glasses,
  GlassesInput,
  GlassesResult,
  GlassesSearch,
  GlassesType,
  SanitizedEyeSearch,
} from '@/model/GlassesModel'
import { sanitizeEyeValues } from '@/util/eye-utils'
import { MaybeRefOrGetter } from 'vue'
import calculateAllPhilscore from '@/lib/philscore'
import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'

export const useFindGlasses = (
  glasses: Ref<GlassesInput>,
  highTolerance: MaybeRefOrGetter<boolean>,
  isValid: MaybeRefOrGetter<boolean>,
) => {
  const matches = ref<null | GlassesResult[]>(null)
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
    matches.value = philScore(eyeModel)
    if (matches.value.length === 0 && isUserSubmitted) {
      glassesStore.addUnsuccessfulSearch(eyeModel)
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

  function philScore(terms: GlassesSearch): GlassesResult[] {
    return calculateAllPhilscore(terms, allGlasses.value || ([] as Glasses[]))
  }
  return {
    matches,
    startSearch,
    reset,
  }
}
