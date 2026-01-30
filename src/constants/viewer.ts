/**
 * ビューアー設定の定数
 * @description 3Dモデルビューアーのデフォルト設定値
 */

import type { CameraSettings, LightingSettings, ViewerSettings } from '@/types/model'

/**
 * 利用可能なHDRIリスト
 */
export const HDRI_LIST = [
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
  lightAzimuth: 45,      // 方位角 45度（右前方）
  lightElevation: 60,    // 仰角 60度（やや上から）
  lightDistance: 12,     // 距離
  hdriIndex: 0,          // デフォルトはhdri-0
  hdriRotation: 0,       // 回転なし
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
  /** グリッドサイズ */
  size: 10,
  /** 分割数 */
  divisions: 10,
  /** メインカラー */
  mainColor: '#444466',
  /** サブカラー */
  subColor: '#222233',
} as const

