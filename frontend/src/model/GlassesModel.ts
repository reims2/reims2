import { ReimsSite } from './ReimsModel'

/* eslint-disable no-unused-vars */
export interface Eye {
  add?: number
  axis: number
  cylinder: number
  sphere: number
}

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

export interface GlassesInput {
  od: Eye
  os: Eye
  glassesType: GlassesType
  appearance: GlassesAppearance
  glassesSize: GlassesSize
}

export interface Glasses extends GlassesInput {
  id: number // backend ID
  sku: number
  creationDate: number
  dispensed?: boolean
  dispense?: Dispense
  location: ReimsSite
}

export type GeneralGlassesDataKey = 'glassesType' | 'appearance' | 'glassesSize'

export interface GlassesResult extends Glasses {
  score: number
  odScore: number
  osScore: number
}

/** Input to PhilScore function, correctly parsed Eye with isBal */
export interface EyeSearch extends Eye {
  // is balance lens => ignore this eye and search for similar sphere only
  isBAL: boolean
}

export interface GlassesSearch {
  glassesType: GlassesType
  od: EyeSearch
  os: EyeSearch
  highTolerance?: boolean
}
