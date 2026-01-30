/**
 * ビューア設定の定数
 * @description 3Dモデルビューアーのデフォルト設定値
 */

import type { CameraSettings, HdriItem, LightingSettings, ViewerSettings } from './types'

/**
 * 利用可能なHDRIリスト
 */
export const HDRI_LIST: readonly HdriItem[] = [
  { id: 0, name: 'Sand', path: '/hdri/hdri-0.hdr' },
  { id: 1, name: 'Sunset', path: '/hdri/hdri-1.hdr' },
  { id: 2, name: 'Studio', path: '/hdri/hdri-2.hdr' },
] as const

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
