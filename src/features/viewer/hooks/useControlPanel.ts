/**
 * コントロールパネル用フック
 * @description ControlPanelコンポーネントのロジックを管理
 * 
 * このフックはビューアー設定とハンドラーを受け取り、
 * ControlPanelコンポーネントで使用するUI設定オブジェクトを生成する。
 * 
 * 責務:
 * - チェックボックス、スライダー、セレクト等のUI設定を構造化
 * - 各設定に対応するラベル、値、ハンドラーをまとめる
 * - useMemoで不要な再計算を防止
 * 
 * @example
 * ```tsx
 * const { checkboxes, background, hdri, light, postEffects } = useControlPanel(settings, handlers)
 * ```
 */

import { useMemo } from 'react'
import type { ViewerSettings, PostEffectSettings } from '../types'
import { HDRI_LIST, POST_EFFECT_SLIDER_RANGES } from '../constants'

// ==========================================
// UI設定の型定義
// ==========================================

/**
 * チェックボックス設定
 * @description トグル系UIの設定を表現
 */
interface CheckboxConfig {
  /** 表示ラベル */
  label: string
  /** 現在の状態 */
  checked: boolean
  /** 状態変更時のコールバック */
  onChange: () => void
}

/**
 * スライダー設定
 * @description 数値入力スライダーの設定を表現
 */
interface SliderConfig {
  /** 表示ラベル */
  label: string
  /** 現在値 */
  value: number
  /** 最小値 */
  min: number
  /** 最大値 */
  max: number
  /** ステップ（省略時は1） */
  step?: number
  /** 単位表示（例: "°", "%"） */
  unit?: string
  /** 値変更時のコールバック */
  onChange: (value: number) => void
}

/**
 * セレクト設定
 * @description ドロップダウン/ラジオボタン等の選択UIの設定
 */
interface SelectConfig {
  /** 表示ラベル */
  label: string
  /** 現在の選択値 */
  value: number | string
  /** 選択肢リスト */
  options: { value: number | string; label: string }[]
  /** 選択変更時のコールバック */
  onChange: (value: number | string) => void
}

/**
 * カラー設定
 * @description カラーピッカーの設定を表現
 */
interface ColorConfig {
  /** 表示ラベル */
  label: string
  /** 現在の色（HEX形式） */
  value: string
  /** 色変更時のコールバック */
  onChange: (color: string) => void
}

/**
 * ポストエフェクト設定
 * @description ポストエフェクトのトグルとスライダーを分離
 */
interface PostEffectConfig {
  /** エフェクトのオン/オフトグル */
  toggles: CheckboxConfig[]
  /** エフェクトパラメータのスライダー */
  sliders: SliderConfig[]
}

// ==========================================
// フック戻り値の型定義
// ==========================================

/**
 * フックの戻り値
 * @description ControlPanelで使用する全設定をまとめた型
 */
interface UseControlPanelReturn {
  /** 表示系チェックボックス（ワイヤーフレーム、グリッド等） */
  checkboxes: CheckboxConfig[]
  /** 背景設定（モード選択とカラーピッカー） */
  background: {
    mode: SelectConfig
    color: ColorConfig
  }
  /** HDRI設定（有効/無効、選択、回転、強度） */
  hdri: {
    enabled: CheckboxConfig
    select: SelectConfig
    rotation: SliderConfig
    intensity: SliderConfig
  }
  /** ライト設定（有効/無効、色、強度、方位角、仰角、距離） */
  light: {
    enabled: CheckboxConfig
    color: ColorConfig
    intensity: SliderConfig
    azimuth: SliderConfig
    elevation: SliderConfig
    distance: SliderConfig
  }
  /** ポストエフェクト設定（トグルとスライダー） */
  postEffects: PostEffectConfig
}

// ==========================================
// ハンドラー型定義
// ==========================================

/**
 * ハンドラー関数の型
 * @description ControlPanelが受け取る全ハンドラーの型
 */
export interface ControlPanelHandlers {
  // 表示系トグル
  onToggleWireframe: () => void
  onToggleGrid: () => void
  onToggleAxes: () => void
  onToggleAutoRotate: () => void

  // 背景設定
  onBackgroundColorChange: (color: string) => void
  onBackgroundModeChange: (mode: 'color' | 'hdri') => void

  // ライト設定
  onLightAzimuthChange: (value: number) => void
  onLightElevationChange: (value: number) => void
  onLightDistanceChange: (value: number) => void
  onToggleDirectionalLight: () => void
  onDirectionalLightColorChange: (color: string) => void
  onDirectionalLightIntensityChange: (value: number) => void

  // HDRI設定
  onHdriIndexChange: (index: number) => void
  onHdriRotationChange: (value: number) => void
  onHdriIntensityChange: (value: number) => void
  onToggleHdri: () => void

  // その他
  onReset: () => void

  // ポストエフェクト関連
  /** ポストエフェクトパラメータの更新 */
  onUpdatePostEffectSetting: <K extends keyof PostEffectSettings>(
    key: K,
    value: PostEffectSettings[K]
  ) => void
  /** ポストエフェクトのオン/オフ切替 */
  onTogglePostEffect: (key: keyof PostEffectSettings) => void
}

// ==========================================
// フック本体
// ==========================================

/**
 * コントロールパネルフック
 * 
 * ビューアー設定とハンドラーからUI設定を生成する。
 * 各設定はuseMemoでメモ化され、不要な再計算を防止。
 * 
 * @param settings - ビューアー設定
 * @param handlers - ハンドラー関数群
 * @returns コントロールパネルに必要な設定オブジェクト
 */
export const useControlPanel = (
  settings: ViewerSettings,
  handlers: ControlPanelHandlers
): UseControlPanelReturn => {
  // 設定から必要な値を分割代入
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

  // ------------------------------------------
  // チェックボックス設定
  // ------------------------------------------
  const checkboxes = useMemo<CheckboxConfig[]>(() => [
    { label: 'ワイヤーフレーム', checked: wireframe, onChange: handlers.onToggleWireframe },
    { label: 'グリッド', checked: showGrid, onChange: handlers.onToggleGrid },
    { label: '軸ヘルパー', checked: showAxes, onChange: handlers.onToggleAxes },
    { label: '自動回転', checked: autoRotate, onChange: handlers.onToggleAutoRotate },
  ], [wireframe, showGrid, showAxes, autoRotate, handlers])

  // ------------------------------------------
  // 背景設定
  // ------------------------------------------
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

  // ------------------------------------------
  // HDRI設定
  // ------------------------------------------
  const hdriOptions = useMemo(() =>
    HDRI_LIST.map(item => ({ value: item.id, label: item.name })),
    []
  )

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

  // ------------------------------------------
  // ライト設定
  // ------------------------------------------
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

  // ------------------------------------------
  // ポストエフェクト設定
  // POST_EFFECT_SLIDER_RANGES定数を活用してmin/max/stepを一元管理
  // ------------------------------------------
  const postEffectsConfig = useMemo<PostEffectConfig>(() => ({
    // エフェクトのオン/オフトグル
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
      { label: 'Glitch', checked: postEffects.glitchEnabled, onChange: () => handlers.onTogglePostEffect('glitchEnabled') },
    ],
    // エフェクトパラメータのスライダー
    // POST_EFFECT_SLIDER_RANGESからmin/max/step値を取得
    sliders: [
      // Bloom（発光効果）
      {
        label: 'Bloom強度',
        value: postEffects.bloomIntensity,
        ...POST_EFFECT_SLIDER_RANGES.bloomIntensity,
        onChange: (v) => handlers.onUpdatePostEffectSetting('bloomIntensity', v),
      },
      {
        label: 'Bloom閾値',
        value: postEffects.bloomThreshold,
        ...POST_EFFECT_SLIDER_RANGES.bloomThreshold,
        onChange: (v) => handlers.onUpdatePostEffectSetting('bloomThreshold', v),
      },
      // Vignette（周辺減光）
      {
        label: 'Vignette Offset',
        value: postEffects.vignetteOffset,
        ...POST_EFFECT_SLIDER_RANGES.vignetteOffset,
        onChange: (v) => handlers.onUpdatePostEffectSetting('vignetteOffset', v),
      },
      {
        label: 'Vignette Darkness',
        value: postEffects.vignetteDarkness,
        ...POST_EFFECT_SLIDER_RANGES.vignetteDarkness,
        onChange: (v) => handlers.onUpdatePostEffectSetting('vignetteDarkness', v),
      },
      // HueSaturation（色相・彩度）
      {
        label: '色相',
        value: postEffects.hue,
        ...POST_EFFECT_SLIDER_RANGES.hue,
        onChange: (v) => handlers.onUpdatePostEffectSetting('hue', v),
      },
      {
        label: '彩度',
        value: postEffects.saturation,
        ...POST_EFFECT_SLIDER_RANGES.saturation,
        onChange: (v) => handlers.onUpdatePostEffectSetting('saturation', v),
      },
      // DepthOfField（被写界深度）
      {
        label: 'DoF Focus',
        value: postEffects.focusDistance,
        ...POST_EFFECT_SLIDER_RANGES.focusDistance,
        onChange: (v) => handlers.onUpdatePostEffectSetting('focusDistance', v),
      },
      {
        label: 'DoF Focal',
        value: postEffects.focalLength,
        ...POST_EFFECT_SLIDER_RANGES.focalLength,
        onChange: (v) => handlers.onUpdatePostEffectSetting('focalLength', v),
      },
      {
        label: 'DoF Bokeh',
        value: postEffects.bokehScale,
        ...POST_EFFECT_SLIDER_RANGES.bokehScale,
        onChange: (v) => handlers.onUpdatePostEffectSetting('bokehScale', v),
      },
      // Pixelation（ピクセル化）
      {
        label: 'Pixel粒度',
        value: postEffects.pixelationGranularity,
        ...POST_EFFECT_SLIDER_RANGES.pixelationGranularity,
        onChange: (v) => handlers.onUpdatePostEffectSetting('pixelationGranularity', v),
      },
      // DotScreen（網点効果）
      {
        label: 'Dotスケール',
        value: postEffects.dotScreenScale,
        ...POST_EFFECT_SLIDER_RANGES.dotScreenScale,
        onChange: (v) => handlers.onUpdatePostEffectSetting('dotScreenScale', v),
      },
      // Glitch（グリッチ効果）
      {
        label: 'Glitch遅延(min)',
        value: postEffects.glitchDelay[0],
        ...POST_EFFECT_SLIDER_RANGES.glitchDelayMin,
        unit: 's',
        onChange: (v) => handlers.onUpdatePostEffectSetting('glitchDelay', [v, postEffects.glitchDelay[1]]),
      },
      {
        label: 'Glitch遅延(max)',
        value: postEffects.glitchDelay[1],
        ...POST_EFFECT_SLIDER_RANGES.glitchDelayMax,
        unit: 's',
        onChange: (v) => handlers.onUpdatePostEffectSetting('glitchDelay', [postEffects.glitchDelay[0], v]),
      },
      {
        label: 'Glitch時間(min)',
        value: postEffects.glitchDuration[0],
        ...POST_EFFECT_SLIDER_RANGES.glitchDurationMin,
        unit: 's',
        onChange: (v) => handlers.onUpdatePostEffectSetting('glitchDuration', [v, postEffects.glitchDuration[1]]),
      },
      {
        label: 'Glitch時間(max)',
        value: postEffects.glitchDuration[1],
        ...POST_EFFECT_SLIDER_RANGES.glitchDurationMax,
        unit: 's',
        onChange: (v) => handlers.onUpdatePostEffectSetting('glitchDuration', [postEffects.glitchDuration[0], v]),
      },
      {
        label: 'Glitch強度(弱)',
        value: postEffects.glitchStrength[0],
        ...POST_EFFECT_SLIDER_RANGES.glitchStrengthWeak,
        onChange: (v) => handlers.onUpdatePostEffectSetting('glitchStrength', [v, postEffects.glitchStrength[1]]),
      },
      {
        label: 'Glitch強度(強)',
        value: postEffects.glitchStrength[1],
        ...POST_EFFECT_SLIDER_RANGES.glitchStrengthStrong,
        onChange: (v) => handlers.onUpdatePostEffectSetting('glitchStrength', [postEffects.glitchStrength[0], v]),
      },
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


