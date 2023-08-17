export type ReimsSite = 'sa' | 'sm'

export type DeletionReason =
  | 'DISPENSED'
  | 'TOO_HIGH_VALUES'
  | 'NOT_FOUND'
  | 'BROKEN'
  | 'OTHER'
  | 'WRONGLY_ADDED'

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
  min?: number
  max?: number
}

export type UserRole = 'ROLE_ADMIN' | 'ROLE_USER'
