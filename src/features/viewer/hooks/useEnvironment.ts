/**
 * 環境設定用フック
 * @description Environmentコンポーネントのロジックを管理
 */

import { useMemo } from 'react'
import type { ViewerSettings } from '../types'
import { DEFAULT_LIGHTING_SETTINGS, GRID_CONFIG, HDRI_LIST } from '../constants'

/**
 * 球面座標からデカルト座標に変換
 * @param azimuth 方位角（度）
 * @param elevation 仰角（度）
 * @param distance 距離
 * @returns [x, y, z] 位置
 */
const sphericalToCartesian = (
  azimuth: number,
  elevation: number,
  distance: number
): [number, number, number] => {
  const azimuthRad = (azimuth * Math.PI) / 180
  const elevationRad = (elevation * Math.PI) / 180

  const y = distance * Math.sin(elevationRad)
  const horizontalDistance = distance * Math.cos(elevationRad)
  const x = horizontalDistance * Math.cos(azimuthRad)
  const z = horizontalDistance * Math.sin(azimuthRad)

  return [x, y, z]
}

/**
 * フックの戻り値
 */
interface UseEnvironmentReturn {
  /** ライト位置 [x, y, z] */
  lightPosition: [number, number, number]
  /** ライト強度 */
  lightIntensity: number
  /** HDRIファイルパス */
  hdriPath: string
  /** HDRI回転（ラジアン） */
  hdriRotationRad: number
  /** グリッド設定 */
  gridConfig: typeof GRID_CONFIG
  /** グリッド表示フラグ */
  showGrid: boolean
  /** 軸ヘルパー表示フラグ */
  showAxes: boolean
  /** 背景色 */
  backgroundColor: string
}

/**
 * 環境設定フック
 * @param settings ビューアー設定
 * @returns 環境設定に必要な計算済みの値
 */
export const useEnvironment = (settings: ViewerSettings): UseEnvironmentReturn => {
  const {
    showGrid,
    showAxes,
    backgroundColor,
    lightAzimuth,
    lightElevation,
    lightDistance,
    hdriIndex,
    hdriRotation,
  } = settings

  // ライト位置を計算（メモ化）
  const lightPosition = useMemo(
    () => sphericalToCartesian(lightAzimuth, lightElevation, lightDistance),
    [lightAzimuth, lightElevation, lightDistance]
  )

  // HDRIパスを取得
  const hdriPath = useMemo(
    () => HDRI_LIST[hdriIndex]?.path ?? HDRI_LIST[0].path,
    [hdriIndex]
  )

  // HDRI回転をラジアンに変換
  const hdriRotationRad = useMemo(
    () => (hdriRotation * Math.PI) / 180,
    [hdriRotation]
  )

  return {
    lightPosition,
    lightIntensity: DEFAULT_LIGHTING_SETTINGS.directionalIntensity,
    hdriPath,
    hdriRotationRad,
    gridConfig: GRID_CONFIG,
    showGrid,
    showAxes,
    backgroundColor,
  }
}
