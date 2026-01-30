/**
 * コントロールパネル用フック
 * @description ControlPanelコンポーネントのロジックを管理
 */

import { useMemo } from 'react'
import type { ViewerSettings } from '../types'
import { HDRI_LIST } from '../constants'

/**
 * チェックボックス設定
 */
interface CheckboxConfig {
  label: string
  checked: boolean
  onChange: () => void
}

/**
 * スライダー設定
 */
interface SliderConfig {
  label: string
  value: number
  min: number
  max: number
  unit?: string
  onChange: (value: number) => void
}

/**
 * セレクト設定
 */
interface SelectConfig {
  label: string
  value: number
  options: { value: number; label: string }[]
  onChange: (value: number) => void
}

/**
 * フックの戻り値
 */
interface UseControlPanelReturn {
  /** チェックボックス設定 */
  checkboxes: CheckboxConfig[]
  /** HDRI設定 */
  hdri: {
    select: SelectConfig
    rotation: SliderConfig
  }
  /** ライト設定 */
  light: {
    azimuth: SliderConfig
    elevation: SliderConfig
    distance: SliderConfig
  }
}

/**
 * ハンドラー関数の型
 */
interface ControlPanelHandlers {
  onToggleWireframe: () => void
  onToggleGrid: () => void
  onToggleAxes: () => void
  onToggleAutoRotate: () => void
  onLightAzimuthChange: (value: number) => void
  onLightElevationChange: (value: number) => void
  onLightDistanceChange: (value: number) => void
  onHdriIndexChange: (index: number) => void
  onHdriRotationChange: (value: number) => void
}

/**
 * コントロールパネルフック
 * @param settings ビューアー設定
 * @param handlers ハンドラー関数
 * @returns コントロールパネルに必要な設定
 */
export const useControlPanel = (
  settings: ViewerSettings,
  handlers: ControlPanelHandlers
): UseControlPanelReturn => {
  const {
    wireframe,
    showGrid,
    showAxes,
    autoRotate,
    lightAzimuth,
    lightElevation,
    lightDistance,
    hdriIndex,
    hdriRotation,
  } = settings

  // チェックボックス設定
  const checkboxes = useMemo<CheckboxConfig[]>(() => [
    { label: 'ワイヤーフレーム', checked: wireframe, onChange: handlers.onToggleWireframe },
    { label: 'グリッド', checked: showGrid, onChange: handlers.onToggleGrid },
    { label: '軸ヘルパー', checked: showAxes, onChange: handlers.onToggleAxes },
    { label: '自動回転', checked: autoRotate, onChange: handlers.onToggleAutoRotate },
  ], [wireframe, showGrid, showAxes, autoRotate, handlers])

  // HDRI選択オプション
  const hdriOptions = useMemo(() =>
    HDRI_LIST.map(item => ({ value: item.id, label: item.name })),
    []
  )

  // HDRI設定
  const hdri = useMemo(() => ({
    select: {
      label: 'HDRI',
      value: hdriIndex,
      options: hdriOptions,
      onChange: handlers.onHdriIndexChange,
    },
    rotation: {
      label: '回転',
      value: hdriRotation,
      min: 0,
      max: 360,
      unit: '°',
      onChange: handlers.onHdriRotationChange,
    },
  }), [hdriIndex, hdriRotation, hdriOptions, handlers])

  // ライト設定
  const light = useMemo(() => ({
    azimuth: {
      label: '方位角',
      value: lightAzimuth,
      min: 0,
      max: 360,
      unit: '°',
      onChange: handlers.onLightAzimuthChange,
    },
    elevation: {
      label: '仰角',
      value: lightElevation,
      min: 10,
      max: 90,
      unit: '°',
      onChange: handlers.onLightElevationChange,
    },
    distance: {
      label: '距離',
      value: lightDistance,
      min: 5,
      max: 30,
      onChange: handlers.onLightDistanceChange,
    },
  }), [lightAzimuth, lightElevation, lightDistance, handlers])

  return {
    checkboxes,
    hdri,
    light,
  }
}
