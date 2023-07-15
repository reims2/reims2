/* eslint-disable no-unused-vars */
import { ReimsSite } from './ReimsModel'

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

export const eyeKeys = ['sphere', 'cylinder', 'axis', 'add'] as const
export type EyeKey = (typeof eyeKeys)[number]

export type GlassesEyeIndex = 'od' | 'os'

export interface Dispense {
  id: number // backend ID
  modifyDate: Date | null
  previousSku: number | null
}

export type GlassesType = 'single' | 'multifocal'
export type GlassesAppearance = 'masculine' | 'feminine' | 'neutral'
export type GlassesSize = 'small' | 'medium' | 'large' | 'child'
export type GeneralGlassesData = GlassesType | GlassesAppearance | GlassesSize

export type GlassesInput = {
  od: OptionalEye
  os: OptionalEye
  glassesType: GlassesType
  appearance: GlassesAppearance
  glassesSize: GlassesSize
}

export interface Glasses extends GlassesInput {
  id: number // backend ID
  sku: number
  od: Eye
  os: Eye
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

/** Input to PhilScore function, correctly parsed Eye with isBal */
export interface EyeSearch extends OptionalEye {
  // is balance lens => ignore this eye and search for similar sphere only
  isBAL: boolean
}

export interface SanitizedEyeSearch extends Eye {
  isBAL: boolean
}

export interface GlassesSearch {
  glassesType: GlassesType
  od: OptionalEye
  os: OptionalEye
  highTolerance?: boolean
}
