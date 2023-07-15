import { createHead } from '@unhead/vue'
import { useHead } from 'unhead'

const head = createHead({})
useHead({
  titleTemplate: (title?: string) => (title && title !== '' ? `${title} - REIMS2` : 'REIMS2'),
})

export default head
