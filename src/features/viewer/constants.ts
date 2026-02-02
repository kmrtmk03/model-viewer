/**
 * ビューア設定の定数
 * @description 3Dモデルビューアーのデフォルト設定値
 */

import type { CameraSettings, HdriItem, LightingSettings, PostEffectSettings, ViewerSettings } from './types'

/**
 * 利用可能なHDRIリスト
 */
export const HDRI_LIST: readonly HdriItem[] = [
  { id: 0, name: 'Sand', path: '/hdri/hdri-0.hdr' },
  { id: 1, name: 'Sunset', path: '/hdri/hdri-1.hdr' },
  { id: 2, name: 'Studio', path: '/hdri/hdri-2.hdr' },
] as const

/**
 * デフォルトのポストエフェクト設定
 */
export const DEFAULT_POST_EFFECT_SETTINGS: PostEffectSettings = {
  // Bloom
  bloomEnabled: false,
  bloomIntensity: 1.0,
  bloomThreshold: 0.9,
  // Vignette
  vignetteEnabled: false,
  vignetteOffset: 0.5,
  vignetteDarkness: 0.5,
  // ToneMapping
  toneMappingEnabled: false,
  // SMAA
  smaaEnabled: true,
  // HueSaturation
  hueSaturationEnabled: false,
  hue: 0,
  saturation: 0,
  // DepthOfField
  depthOfFieldEnabled: false,
  focusDistance: 0.02,
  focalLength: 0.5,
  bokehScale: 2,
  // ColorAverage
  colorAverageEnabled: false,
  // Pixelation
  pixelationEnabled: false,
  pixelationGranularity: 5,
  // DotScreen
  dotScreenEnabled: false,
  dotScreenScale: 1.0,
}

/**
 * デフォルトのビューアー設定
 */
export const DEFAULT_VIEWER_SETTINGS: ViewerSettings = {
  wireframe: false,
  showGrid: true,
  showAxes: false,
  backgroundColor: '#1a1a2e',
  autoRotate: false,
  lightAzimuth: 45,
  lightElevation: 60,
  lightDistance: 12,
  directionalLightEnabled: true,
  directionalLightColor: '#ffffff',
  directionalLightIntensity: 1.0,
  hdriIndex: 0,
  hdriRotation: 0,
  hdriIntensity: 0.5,
  hdriEnabled: true,
  backgroundMode: 'color',
  postEffects: DEFAULT_POST_EFFECT_SETTINGS,
}

/**
 * デフォルトのカメラ設定
 */
export const DEFAULT_CAMERA_SETTINGS: CameraSettings = {
  position: [3, 3, 3],
  fov: 45,
  near: 0.1,
  far: 1000,
}

/**
 * デフォルトのライティング設定
 */
export const DEFAULT_LIGHTING_SETTINGS: LightingSettings = {
  ambientIntensity: 0.5,
  directionalIntensity: 1,
  directionalPosition: [5, 10, 5],
}

/**
 * グリッド設定
 */
export const GRID_CONFIG = {
  size: 10,
  divisions: 10,
  mainColor: '#444466',
  subColor: '#222233',
} as const
