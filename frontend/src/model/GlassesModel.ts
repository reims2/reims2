/* eslint-disable no-unused-vars */
import { DeletionReason, ReimsSite } from '@/model/ReimsModel'

export interface OptionalEye {
  add?: number | ''
  axis: number | ''
  cylinder: number | ''
  sphere: number | ''
}

export interface Eye extends OptionalEye {
  add?: number
  axis: number
  cylinder: number
  sphere: number
}

export interface DisplayedEye {
  add: string
  axis: string
  cylinder: string
  sphere: string
}

export interface MultifocalEye extends Eye {
  add: number
}

export function hasAdd(data: Eye): data is MultifocalEye {
  return data.add !== undefined
}

export const eyeKeys = ['sphere', 'cylinder', 'axis', 'add'] as const
export type EyeKey = (typeof eyeKeys)[number]

export type GlassesEyeIndex = 'od' | 'os'

export interface Dispense {
  modifyDate: number | null
  previousSku: number | null
  dispenseReason: DeletionReason | null
}

export type GlassesType = 'single' | 'multifocal'
export type GlassesAppearance = 'masculine' | 'feminine' | 'neutral'
export type GlassesSize = 'small' | 'medium' | 'large' | 'child'
export type GeneralGlassesData = GlassesType | GlassesAppearance | GlassesSize

export type GlassesMeta = {
  glassesType: GlassesType
  appearance: GlassesAppearance
  glassesSize: GlassesSize
}

export interface GlassesInput extends GlassesMeta {
  od: DisplayedEye
  os: DisplayedEye
}

export interface DisplayedGlasses extends GlassesInput {
  sku?: string
  creationDate?: string
}

export interface SanitizedGlassesInput extends GlassesMeta {
  od: Eye
  os: Eye
}

export interface Glasses extends SanitizedGlassesInput {
  id: number // backend ID
  sku: number | null
  creationDate: number
  dispensed?: boolean
  dispense?: Dispense
  location: ReimsSite
}

export const generalGlassesDataKeys = ['glassesType', 'appearance', 'glassesSize'] as const
export type GeneralGlassesDataKey = (typeof generalGlassesDataKeys)[number]

export interface GlassesResult extends Glasses {
  score: number
  odScore: number
  osScore: number
}

/** Input to PhilScore function, correctly parsed Eye with isBAL */
export interface EyeSearch extends DisplayedEye {
  // is balance lens => ignore this eye and search for similar sphere only
  isBAL: boolean
}

export interface SanitizedEyeSearch extends Eye {
  isBAL: boolean
}

export interface GlassesSearch {
  glassesType: GlassesType
  od: SanitizedEyeSearch
  os: SanitizedEyeSearch
  highTolerance?: boolean
}

export interface UnsuccessfulGlassesSearch {
  glassesType: GlassesType
  od: Eye
  os: Eye
  highTolerance?: boolean
  balLens: 'DISABLE_OD' | 'DISABLE_OS' | 'DISABLE_NONE'
  location: ReimsSite
  searchDate: number
}
