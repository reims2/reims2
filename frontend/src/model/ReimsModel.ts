import { reimsSiteNames } from '@/lib/util'

export type ReimsSite = keyof typeof reimsSiteNames

export interface DrawerItem {
  icon: string
  title: string
  to: string
  disabled?: boolean
}

export type ValidationRule = (v: any) => boolean | string
