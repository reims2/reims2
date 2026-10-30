import type { components } from '@/model/api'

export type ReimsSite = components['schemas']['GlassesResponseDTO']['location']

export type DeletionReason = NonNullable<
  components['schemas']['DispenseResponseDTO']['dispenseReason']
>

export interface DrawerItem {
  icon: string
  title: string
  to: string
  disabled?: boolean
}

export type ValidationRule = (v: unknown) => boolean | string

export type Nullable<T> = { [K in keyof T]: T[K] | null }

export function isString(data: unknown): data is string {
  return typeof data === 'string'
}

export function isNumber(data: unknown): data is number {
  return typeof data === 'number'
}

export interface TableSortBy {
  key: string
  order: 'asc' | 'desc'
}

export interface MinMaxObject {
  min?: string
  max?: string
}

export type UserRole = 'ROLE_ADMIN' | 'ROLE_USER'
