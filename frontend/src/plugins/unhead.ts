import { createHead } from '@unhead/vue'
import { useHead } from 'unhead'

const head = createHead({})
useHead({
  titleTemplate: '%s - REIMS2',
})

export default head
