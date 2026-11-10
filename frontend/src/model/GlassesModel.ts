import type { components } from '@/model/api'

// what the server sends and takes comes from backend/openapi.json, the rest is UI state
type Schemas = components['schemas']

export interface OptionalEye {
  add?: number | ''
  axis: number | ''
  cylinder: number | ''
  sphere: number | ''
}

export type Eye = Schemas['EyeDTO']

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

export function isEyeSearch(value: OptionalEye | DisplayedEye | EyeSearch): value is EyeSearch {
  return 'isBAL' in value
}

export type MultifocalEye = Eye & { add: number }

export function hasAdd(data: Eye): data is MultifocalEye {
  return data.add !== undefined
}

export const eyeKeys = ['sphere', 'cylinder', 'axis', 'add'] as const
export type EyeKey = (typeof eyeKeys)[number]

export type GlassesEyeIndex = 'od' | 'os'

export type Dispense = Schemas['DispenseResponseDTO']

export type Glasses = Schemas['GlassesResponseDTO']
export type GlassesType = Glasses['glassesType']
export type GlassesAppearance = Glasses['appearance']
export type GlassesSize = Glasses['glassesSize']
export type GeneralGlassesData = GlassesType | GlassesAppearance | GlassesSize

export type GlassesMeta = Pick<Glasses, 'glassesType' | 'appearance' | 'glassesSize'>

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

export type SanitizedGlassesInput = Omit<Schemas['GlassesRequestDTO'], 'location'>

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
