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

// ==========================================
// ポストエフェクト関連定数
// ==========================================

/**
 * スライダー設定の型
 * @description min/max/step値を定義
 */
interface SliderRange {
  min: number
  max: number
  step: number
}

/**
 * ポストエフェクトスライダー設定
 * @description 各パラメータのmin/max/step値を集約
 * useControlPanelで使用
 */
export const POST_EFFECT_SLIDER_RANGES = {
  // Bloom
  bloomIntensity: { min: 0, max: 3, step: 0.1 },
  bloomThreshold: { min: 0, max: 1, step: 0.1 },
  // Vignette
  vignetteOffset: { min: 0, max: 1, step: 0.1 },
  vignetteDarkness: { min: 0, max: 1, step: 0.1 },
  // HueSaturation
  hue: { min: -1, max: 1, step: 0.1 },
  saturation: { min: -1, max: 1, step: 0.1 },
  // DepthOfField
  focusDistance: { min: 0, max: 10, step: 0.1 },
  focalLength: { min: 0, max: 1, step: 0.01 },
  bokehScale: { min: 0, max: 10, step: 0.5 },
  // Pixelation
  pixelationGranularity: { min: 1, max: 20, step: 1 },
  // DotScreen
  dotScreenScale: { min: 0.5, max: 3, step: 0.1 },
} as const satisfies Record<string, SliderRange>

/**
 * グリッチエフェクトのスライダー範囲
 * @description タプル型パラメータ（delay/duration/strength）の設定範囲
 * 
 * 各パラメータは [min, max] のタプルで管理されるため、
 * 専用のオブジェクト構造で範囲を定義する。
 */
export const GLITCH_SLIDER_RANGES = {
  /** 発生間隔（秒）: 次のグリッチまでの待機時間 */
  delay: {
    min: { min: 0.1, max: 5, step: 0.1 },
    max: { min: 0.5, max: 10, step: 0.1 },
  },
  /** 持続時間（秒）: グリッチが継続する時間 */
  duration: {
    min: { min: 0.1, max: 2, step: 0.1 },
    max: { min: 0.2, max: 3, step: 0.1 },
  },
  /** 強度: 弱いグリッチと強いグリッチの強さ */
  strength: {
    weak: { min: 0, max: 1, step: 0.1 },
    strong: { min: 0.1, max: 2, step: 0.1 },
  },
} as const

/**
 * デフォルトのポストエフェクト設定
 * @description 全エフェクトの初期値（SMAAのみデフォルト有効）
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
  // SMAA（デフォルト有効 - 基本的なアンチエイリアシング）
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
  // Glitch
  glitchEnabled: false,
  glitchDelay: [1.5, 3.5],
  glitchDuration: [0.6, 1.0],
  glitchStrength: [0.3, 1.0],
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

