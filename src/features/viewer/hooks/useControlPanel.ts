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
  step?: number
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
 * カラー設定
 */
interface ColorConfig {
  label: string
  value: string
  onChange: (color: string) => void
}

/**
 * フックの戻り値
 */
interface UseControlPanelReturn {
  /** チェックボックス設定 */
  checkboxes: CheckboxConfig[]
  /** 背景色設定 */
  background: ColorConfig
  /** HDRI設定 */
  hdri: {
    enabled: CheckboxConfig
    select: SelectConfig
    rotation: SliderConfig
    intensity: SliderConfig
  }
  /** ライト設定 */
  light: {
    enabled: CheckboxConfig
    color: ColorConfig
    intensity: SliderConfig
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
  onBackgroundColorChange: (color: string) => void
  onLightAzimuthChange: (value: number) => void
  onLightElevationChange: (value: number) => void
  onLightDistanceChange: (value: number) => void
  onToggleDirectionalLight: () => void
  onDirectionalLightColorChange: (color: string) => void
  onDirectionalLightIntensityChange: (value: number) => void
  onHdriIndexChange: (index: number) => void
  onHdriRotationChange: (value: number) => void
  onHdriIntensityChange: (value: number) => void
  onToggleHdri: () => void
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
    backgroundColor,
    lightAzimuth,
    lightElevation,
    lightDistance,
    directionalLightEnabled,
    directionalLightColor,
    directionalLightIntensity,
    hdriIndex,
    hdriRotation,
    hdriIntensity,
    hdriEnabled,
  } = settings

  // チェックボックス設定
  const checkboxes = useMemo<CheckboxConfig[]>(() => [
    { label: 'ワイヤーフレーム', checked: wireframe, onChange: handlers.onToggleWireframe },
    { label: 'グリッド', checked: showGrid, onChange: handlers.onToggleGrid },
    { label: '軸ヘルパー', checked: showAxes, onChange: handlers.onToggleAxes },
    { label: '自動回転', checked: autoRotate, onChange: handlers.onToggleAutoRotate },
  ], [wireframe, showGrid, showAxes, autoRotate, handlers])

  // 背景色設定
  const background = useMemo<ColorConfig>(() => ({
    label: '背景色',
    value: backgroundColor,
    onChange: handlers.onBackgroundColorChange,
  }), [backgroundColor, handlers])

  // HDRI選択オプション
  const hdriOptions = useMemo(() =>
    HDRI_LIST.map(item => ({ value: item.id, label: item.name })),
    []
  )

  // HDRI設定
  const hdri = useMemo(() => ({
    enabled: {
      label: 'HDRI環境マップ',
      checked: hdriEnabled,
      onChange: handlers.onToggleHdri,
    },
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
    intensity: {
      label: '強度',
      value: hdriIntensity,
      min: 0,
      max: 2,
      step: 0.1,
      onChange: handlers.onHdriIntensityChange,
    },
  }), [hdriIndex, hdriRotation, hdriIntensity, hdriEnabled, hdriOptions, handlers])

  // ライト設定
  const light = useMemo(() => ({
    enabled: {
      label: 'ディレクショナルライト',
      checked: directionalLightEnabled,
      onChange: handlers.onToggleDirectionalLight,
    },
    color: {
      label: 'ライト色',
      value: directionalLightColor,
      onChange: handlers.onDirectionalLightColorChange,
    },
    intensity: {
      label: '強度',
      value: directionalLightIntensity,
      min: 0,
      max: 3,
      step: 0.1,
      onChange: handlers.onDirectionalLightIntensityChange,
    },
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
  }), [lightAzimuth, lightElevation, lightDistance, directionalLightEnabled, directionalLightColor, directionalLightIntensity, handlers])

  return {
    checkboxes,
    background,
    hdri,
    light,
  }
}
