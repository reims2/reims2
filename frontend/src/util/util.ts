import { ReimsSite } from '@/model/ReimsModel'

export const reimsSiteMap: { [site in ReimsSite]: string } = {
  sa: 'Santa Ana',
  sm: 'San Miguel',
}

// For use in <v-select>, as object with title and value
export const reimsSiteSelects: { title: string; value: ReimsSite }[] = Object.entries(
  reimsSiteMap,
).map(([value, title]) => ({
  title,
  value: value as ReimsSite,
}))
