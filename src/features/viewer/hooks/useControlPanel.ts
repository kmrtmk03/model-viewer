/**
 * コントロールパネル用フック
 * @description ControlPanelコンポーネントのロジックを管理
 */

import { useMemo } from 'react'
import type { ViewerSettings, PostEffectSettings } from '../types'
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
  value: number | string
  options: { value: number | string; label: string }[]
  /** 選択変更時のコールバック (数値または文字列) */
  onChange: (value: number | string) => void
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
 * ポストエフェクト設定
 */
interface PostEffectConfig {
  toggles: CheckboxConfig[]
  sliders: SliderConfig[]
}

/**
 * フックの戻り値
 */
interface UseControlPanelReturn {
  /** チェックボックス設定 */
  checkboxes: CheckboxConfig[]
  /** 背景色設定 */
  background: {
    mode: SelectConfig
    color: ColorConfig
  }
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
  /** ポストエフェクト設定 */
  postEffects: PostEffectConfig
}

/**
 * ハンドラー関数の型
 */
export interface ControlPanelHandlers {
  onToggleWireframe: () => void
  onToggleGrid: () => void
  onToggleAxes: () => void
  onToggleAutoRotate: () => void
  onBackgroundColorChange: (color: string) => void
  onBackgroundModeChange: (mode: 'color' | 'hdri') => void
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
  onReset: () => void
  // ポストエフェクト関連
  onUpdatePostEffectSetting: <K extends keyof PostEffectSettings>(
    key: K,
    value: PostEffectSettings[K]
  ) => void
  onTogglePostEffect: (key: keyof PostEffectSettings) => void
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
    postEffects,
  } = settings

  // チェックボックス設定
  const checkboxes = useMemo<CheckboxConfig[]>(() => [
    { label: 'ワイヤーフレーム', checked: wireframe, onChange: handlers.onToggleWireframe },
    { label: 'グリッド', checked: showGrid, onChange: handlers.onToggleGrid },
    { label: '軸ヘルパー', checked: showAxes, onChange: handlers.onToggleAxes },
    { label: '自動回転', checked: autoRotate, onChange: handlers.onToggleAutoRotate },
  ], [wireframe, showGrid, showAxes, autoRotate, handlers])

  // 背景色設定
  const background = useMemo(() => ({
    mode: {
      label: '背景モード',
      value: settings.backgroundMode,
      options: [
        { label: '単色', value: 'color' },
        { label: 'HDRI', value: 'hdri' },
      ],
      onChange: (value: number | string) => handlers.onBackgroundModeChange(value as 'color' | 'hdri'),
    },
    color: {
      label: '背景色',
      value: backgroundColor,
      onChange: handlers.onBackgroundColorChange,
    },
  }), [settings.backgroundMode, backgroundColor, handlers])

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
      onChange: (value: number | string) => handlers.onHdriIndexChange(Number(value)),
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

  // ポストエフェクト設定
  const postEffectsConfig = useMemo<PostEffectConfig>(() => ({
    toggles: [
      { label: 'SMAA (AA)', checked: postEffects.smaaEnabled, onChange: () => handlers.onTogglePostEffect('smaaEnabled') },
      { label: 'Bloom', checked: postEffects.bloomEnabled, onChange: () => handlers.onTogglePostEffect('bloomEnabled') },
      { label: 'Vignette', checked: postEffects.vignetteEnabled, onChange: () => handlers.onTogglePostEffect('vignetteEnabled') },
      { label: 'ToneMapping', checked: postEffects.toneMappingEnabled, onChange: () => handlers.onTogglePostEffect('toneMappingEnabled') },
      { label: 'HueSaturation', checked: postEffects.hueSaturationEnabled, onChange: () => handlers.onTogglePostEffect('hueSaturationEnabled') },
      { label: 'DepthOfField', checked: postEffects.depthOfFieldEnabled, onChange: () => handlers.onTogglePostEffect('depthOfFieldEnabled') },
      { label: 'ColorAverage', checked: postEffects.colorAverageEnabled, onChange: () => handlers.onTogglePostEffect('colorAverageEnabled') },
      { label: 'Pixelation', checked: postEffects.pixelationEnabled, onChange: () => handlers.onTogglePostEffect('pixelationEnabled') },
      { label: 'DotScreen', checked: postEffects.dotScreenEnabled, onChange: () => handlers.onTogglePostEffect('dotScreenEnabled') },
    ],
    sliders: [
      // Bloom
      { label: 'Bloom強度', value: postEffects.bloomIntensity, min: 0, max: 3, step: 0.1, onChange: (v) => handlers.onUpdatePostEffectSetting('bloomIntensity', v) },
      { label: 'Bloom閾値', value: postEffects.bloomThreshold, min: 0, max: 1, step: 0.1, onChange: (v) => handlers.onUpdatePostEffectSetting('bloomThreshold', v) },
      // Vignette
      { label: 'Vignette Offset', value: postEffects.vignetteOffset, min: 0, max: 1, step: 0.1, onChange: (v) => handlers.onUpdatePostEffectSetting('vignetteOffset', v) },
      { label: 'Vignette Darkness', value: postEffects.vignetteDarkness, min: 0, max: 1, step: 0.1, onChange: (v) => handlers.onUpdatePostEffectSetting('vignetteDarkness', v) },
      // HueSaturation
      { label: '色相', value: postEffects.hue, min: -1, max: 1, step: 0.1, onChange: (v) => handlers.onUpdatePostEffectSetting('hue', v) },
      { label: '彩度', value: postEffects.saturation, min: -1, max: 1, step: 0.1, onChange: (v) => handlers.onUpdatePostEffectSetting('saturation', v) },
      // DepthOfField
      { label: 'DoF Focus', value: postEffects.focusDistance, min: 0, max: 10, step: 0.1, onChange: (v) => handlers.onUpdatePostEffectSetting('focusDistance', v) },
      { label: 'DoF Focal', value: postEffects.focalLength, min: 0, max: 1, step: 0.01, onChange: (v) => handlers.onUpdatePostEffectSetting('focalLength', v) },
      { label: 'DoF Bokeh', value: postEffects.bokehScale, min: 0, max: 10, step: 0.5, onChange: (v) => handlers.onUpdatePostEffectSetting('bokehScale', v) },
      // Pixelation
      { label: 'Pixel粒度', value: postEffects.pixelationGranularity, min: 1, max: 20, step: 1, onChange: (v) => handlers.onUpdatePostEffectSetting('pixelationGranularity', v) },
      // DotScreen
      { label: 'Dotスケール', value: postEffects.dotScreenScale, min: 0.5, max: 3, step: 0.1, onChange: (v) => handlers.onUpdatePostEffectSetting('dotScreenScale', v) },
    ],
  }), [postEffects, handlers])

  return {
    checkboxes,
    background,
    hdri,
    light,
    postEffects: postEffectsConfig,
  }
}

