<template>
  <page-layout title="What to refill">
    <template #chips>
      <v-chip variant="flat" color="primary-tonal" class="font-weight-bold text-tabular">
        {{ rootStore.reimsSiteName }} · {{ glassesStore.freeSkus.toLocaleString('en-US') }} free
        SKUs
      </v-chip>
      <v-chip variant="tonal" :prepend-icon="mdiFlaskOutline">Experimental</v-chip>
    </template>
    <v-col cols="12" lg="8">
      <page-card title="Glasses to look for" :icon="mdiFormatListChecks" tone="marigold">
        <template #header>
          <v-chip size="small" variant="tonal" color="success" :prepend-icon="mdiCircleMedium">
            Live
          </v-chip>
        </template>

        <div class="px-6 pt-5 pb-5 text-body-large">
          <p class="ma-0">
            Fill the free SKUs with these, top first. They fit patients who found nothing in today's
            stock at past campaigns, the top ones the most patients.
            <a :href="docsUrl" target="_blank" rel="noopener noreferrer" class="text-primary">
              How this works
            </a>
          </p>
        </div>

        <div v-if="error" class="px-6 pb-6">
          <v-alert type="error" variant="tonal" density="comfortable">
            Could not load past campaigns ({{ error }})
          </v-alert>
        </div>
        <v-skeleton-loader v-else-if="!plan" type="list-item@5" />
        <p v-else-if="glassesStore.freeSkus === 0" class="px-6 pb-6 ma-0 text-body-large">
          There are no free SKUs, so there is nothing to refill.
        </p>
        <div v-else role="list" class="border-t">
          <div
            class="d-flex justify-space-between px-6 py-2 border-b bg-surface-light text-label-large text-medium-emphasis"
            aria-hidden="true"
          >
            <span>Look for</span>
            <span>Pairs</span>
          </div>
          <div
            v-for="(row, idx) in rows"
            :key="idx"
            role="listitem"
            class="d-flex align-center ga-4 px-6 py-4"
            :class="{ 'border-b': idx < rows.length - 1 }"
          >
            <v-avatar
              v-if="row.number"
              color="marigold-tonal"
              size="32"
              class="text-marigold font-weight-bold"
            >
              {{ row.number }}
            </v-avatar>
            <v-avatar v-else color="surface-muted" size="32" class="text-medium-emphasis">
              <v-icon :icon="mdiDotsHorizontal" />
            </v-avatar>
            <p class="flex-1-1 text-body-large ma-0">{{ row.text }}</p>
            <p class="text-title-large font-weight-bold text-no-wrap text-tabular ma-0">
              {{ row.pairs }}
            </p>
          </div>
        </div>
      </page-card>
    </v-col>
  </page-layout>
</template>

<script setup lang="ts">
import { mdiCircleMedium, mdiDotsHorizontal, mdiFlaskOutline, mdiFormatListChecks } from '@mdi/js'
import PageLayout from '@/components/PageLayout.vue'
import PageCard from '@/components/PageCard.vue'
import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'
import {
  PastPatient,
  RefillPlan,
  RefillRule,
  cylinderBands,
  planRefill,
  toPatients,
} from '@/lib/refill'
import { Glasses } from '@/model/GlassesModel'
import { displayDiopter } from '@/util/format-glasses'

const docsUrl = '/docs/guide/reports#what-to-refill'

const glassesStore = useGlassesStore()
const rootStore = useRootStore()

const past = shallowRef<{ gone: Glasses[]; patients: PastPatient[] } | null>(null)
const plan = shallowRef<RefillPlan | null>(null)
const error = ref('')
const active = ref(false)

async function load() {
  error.value = ''
  past.value = null
  try {
    const [gone, failed] = await Promise.all([
      glassesStore.getDispensedGlasses(),
      glassesStore.getUnsuccessfulSearches(),
    ])
    past.value = { gone, patients: toPatients(gone, failed) }
  } catch (e) {
    error.value = (e as Error).message
  }
}

// past campaigns load once per visit, the plan follows the stock while the page is open
async function calculate() {
  if (!past.value || !active.value) {
    plan.value = null
    return
  }
  // the calculation takes a moment, let the loading state paint first
  await new Promise((resolve) => setTimeout(resolve))
  const stock = glassesStore.allGlasses
  plan.value = planRefill(
    stock,
    [...stock, ...past.value.gone],
    past.value.patients,
    glassesStore.freeSkus,
  )
}

onActivated(() => {
  active.value = true
  load()
})
onDeactivated(() => (active.value = false))
watch(
  () => rootStore.reimsSite,
  () => active.value && load(),
)
watch([past, () => glassesStore.allGlasses], calculate)

const rows = computed(() => {
  if (!plan.value) return []
  const { rules, rest } = plan.value
  return [
    ...rules.map((rule, i) => ({ number: i + 1, text: describe(rule), pairs: rule.pairs })),
    ...(rest > 0
      ? [
          {
            number: 0,
            text: rules.length ? 'Any other glasses' : 'Any glasses, stock fits every past patient',
            pairs: rest,
          },
        ]
      : []),
  ]
})

function cylinderText([c0, c1]: [number, number]) {
  const from = displayDiopter(c0 === 0 ? 0 : -(cylinderBands[c0 - 1] + 0.25))
  if (c1 === cylinderBands.length - 1) return c0 === 0 ? 'any cylinder' : `cylinder ${from} or more`
  return `cylinder ${from} to ${displayDiopter(-cylinderBands[c1])}`
}

function describe(rule: RefillRule) {
  const [s0, s1] = rule.sphere.map(displayDiopter)
  return [
    rule.glassesType === 'single' ? 'Single vision' : 'Multifocal',
    s0 === s1 ? `both eyes around ${s0}` : `both eyes ${s0} to ${s1}`,
    cylinderText(rule.cylinder),
  ].join(', ')
}
</script>
