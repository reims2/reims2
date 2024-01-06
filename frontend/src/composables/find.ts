import {
  EyeSearch,
  Glasses,
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
  osEye: MaybeRefOrGetter<EyeSearch>,
  odEye: MaybeRefOrGetter<EyeSearch>,
  glassesTypeInput: MaybeRefOrGetter<string>,
  highTolerance: MaybeRefOrGetter<boolean>,
  isValid: MaybeRefOrGetter<boolean>,
) => {
  const matches = ref<null | GlassesResult[]>(null)
  const glassesStore = useGlassesStore()
  const rootStore = useRootStore()
  const allGlasses = computed(() => glassesStore.allGlasses)
  const reimsSite = computed(() => rootStore.reimsSite)

  function startSearch() {
    if (!toValue(isValid)) return
    const eyeModel: GlassesSearch = {
      glassesType: toValue(glassesTypeInput) as GlassesType,
      os: sanitizeEyeValues(toValue(osEye)) as SanitizedEyeSearch,
      od: sanitizeEyeValues(toValue(odEye)) as SanitizedEyeSearch,
      highTolerance: toValue(highTolerance),
    }
    matches.value = philScore(eyeModel)
    if (matches.value.length === 0) {
      glassesStore.addUnsuccessfulSearch(eyeModel)
    }
  }

  function reset() {
    matches.value = null
  }

  watch(
    () => glassesStore.allGlassesHash,
    () => {
      if (matches.value != null) startSearch()
    },
  )

  watch(
    () => [osEye, odEye, glassesTypeInput, highTolerance, reimsSite],
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
