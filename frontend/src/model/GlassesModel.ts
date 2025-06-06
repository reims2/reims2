 
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

/** Input to PhilScore function, correctly parsed Eye with isBAL */
export interface EyeSearch extends DisplayedEye {
  // is balance lens => ignore this eye and search for similar sphere only
  isBAL: boolean
}

export function isEyeSearch(value: DisplayedEye | EyeSearch): value is EyeSearch {
  return 'isBAL' in value
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

export interface GlassesInput {
  od: DisplayedEye | EyeSearch
  os: DisplayedEye | EyeSearch
  glassesType: GlassesType | ''
  appearance?: GlassesAppearance | ''
  glassesSize?: GlassesSize | ''
}

export interface DisplayedGlasses extends GlassesInput {
  glassesType: GlassesType
  appearance: GlassesAppearance
  glassesSize: GlassesSize
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
  increaseSearchTolerance: boolean
  balLens: 'DISABLE_OD' | 'DISABLE_OS' | 'DISABLE_NONE'
  searchDate: number
}
