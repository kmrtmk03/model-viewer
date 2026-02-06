/**
 * ポストエフェクト設定フック
 * @description ポストエフェクトのUI設定を生成
 * 
 * useControlPanelから分離してコードの保守性を向上。
 * 各エフェクトをグループ化し、サブアコーディオン表示用のデータ構造を生成。
 * 
 * @example
 * ```tsx
 * const postEffectsConfig = usePostEffectsConfig(postEffects, handlers)
 * ```
 */

import { useMemo } from 'react'
import type { PostEffectSettings } from '../types'
import { POST_EFFECT_SLIDER_RANGES, GLITCH_SLIDER_RANGES } from '../constants'

// ==========================================
// 型定義
// ==========================================

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
 * エフェクトグループ設定
 * @description 各エフェクトのトグルとスライダーをグループ化
 */
export interface EffectGroup {
  name: string
  toggle: CheckboxConfig
  sliders: SliderConfig[]
}

/**
 * ポストエフェクト設定
 */
export interface PostEffectConfig {
  effects: EffectGroup[]
}

/**
 * ハンドラー型（必要な関数のみ）
 */
interface PostEffectHandlers {
  onTogglePostEffect: (key: keyof PostEffectSettings) => void
  onUpdatePostEffectSetting: <K extends keyof PostEffectSettings>(
    key: K,
    value: PostEffectSettings[K]
  ) => void
}

// ==========================================
// ヘルパー関数
// ==========================================

/**
 * トグル設定を生成するヘルパー
 * @description 繰り返しパターンを削減
 */
const createToggle = (
  postEffects: PostEffectSettings,
  handlers: PostEffectHandlers,
  key: keyof PostEffectSettings
): CheckboxConfig => ({
  label: '有効',
  checked: postEffects[key] as boolean,
  onChange: () => handlers.onTogglePostEffect(key),
})

/**
 * スライダー設定を生成するヘルパー
 */
const createSlider = (
  label: string,
  value: number,
  range: { min: number; max: number; step?: number },
  onChange: (v: number) => void,
  unit?: string
): SliderConfig => ({
  label,
  value,
  ...range,
  unit,
  onChange,
})

/**
 * タプル型パラメータ用スライダーを生成するヘルパー
 * @description Glitchのような[min, max]形式のパラメータ用
 */
const createTupleSlider = <K extends 'glitchDelay' | 'glitchDuration' | 'glitchStrength'>(
  postEffects: PostEffectSettings,
  handlers: PostEffectHandlers,
  label: string,
  key: K,
  index: 0 | 1,
  range: { min: number; max: number; step?: number },
  unit?: string
): SliderConfig => ({
  label,
  value: postEffects[key][index],
  ...range,
  unit,
  onChange: (v) => {
    const current = postEffects[key]
    const newValue: [number, number] = index === 0
      ? [v, current[1]]
      : [current[0], v]
    handlers.onUpdatePostEffectSetting(key, newValue)
  },
})

// ==========================================
// フック本体
// ==========================================

/**
 * ポストエフェクト設定フック
 * 
 * @param postEffects - ポストエフェクト設定
 * @param handlers - ハンドラー関数群
 * @returns ポストエフェクトUI設定
 */
export const usePostEffectsConfig = (
  postEffects: PostEffectSettings,
  handlers: PostEffectHandlers
): PostEffectConfig => {
  return useMemo<PostEffectConfig>(() => ({
    effects: [
      // ------------------------------------------
      // SMAA（アンチエイリアシング）
      // ------------------------------------------
      {
        name: 'SMAA (AA)',
        toggle: createToggle(postEffects, handlers, 'smaaEnabled'),
        sliders: [],
      },

      // ------------------------------------------
      // Bloom（発光効果）
      // ------------------------------------------
      {
        name: 'Bloom',
        toggle: createToggle(postEffects, handlers, 'bloomEnabled'),
        sliders: [
          createSlider('強度', postEffects.bloomIntensity, POST_EFFECT_SLIDER_RANGES.bloomIntensity,
            (v) => handlers.onUpdatePostEffectSetting('bloomIntensity', v)),
          createSlider('閾値', postEffects.bloomThreshold, POST_EFFECT_SLIDER_RANGES.bloomThreshold,
            (v) => handlers.onUpdatePostEffectSetting('bloomThreshold', v)),
        ],
      },

      // ------------------------------------------
      // Vignette（周辺減光）
      // ------------------------------------------
      {
        name: 'Vignette',
        toggle: createToggle(postEffects, handlers, 'vignetteEnabled'),
        sliders: [
          createSlider('オフセット', postEffects.vignetteOffset, POST_EFFECT_SLIDER_RANGES.vignetteOffset,
            (v) => handlers.onUpdatePostEffectSetting('vignetteOffset', v)),
          createSlider('暗さ', postEffects.vignetteDarkness, POST_EFFECT_SLIDER_RANGES.vignetteDarkness,
            (v) => handlers.onUpdatePostEffectSetting('vignetteDarkness', v)),
        ],
      },

      // ------------------------------------------
      // ToneMapping（色調マッピング）
      // ------------------------------------------
      {
        name: 'ToneMapping',
        toggle: createToggle(postEffects, handlers, 'toneMappingEnabled'),
        sliders: [],
      },

      // ------------------------------------------
      // HueSaturation（色相・彩度）
      // ------------------------------------------
      {
        name: 'HueSaturation',
        toggle: createToggle(postEffects, handlers, 'hueSaturationEnabled'),
        sliders: [
          createSlider('色相', postEffects.hue, POST_EFFECT_SLIDER_RANGES.hue,
            (v) => handlers.onUpdatePostEffectSetting('hue', v)),
          createSlider('彩度', postEffects.saturation, POST_EFFECT_SLIDER_RANGES.saturation,
            (v) => handlers.onUpdatePostEffectSetting('saturation', v)),
        ],
      },

      // ------------------------------------------
      // DepthOfField（被写界深度）
      // ------------------------------------------
      {
        name: 'DepthOfField',
        toggle: createToggle(postEffects, handlers, 'depthOfFieldEnabled'),
        sliders: [
          createSlider('フォーカス', postEffects.focusDistance, POST_EFFECT_SLIDER_RANGES.focusDistance,
            (v) => handlers.onUpdatePostEffectSetting('focusDistance', v)),
          createSlider('焦点距離', postEffects.focalLength, POST_EFFECT_SLIDER_RANGES.focalLength,
            (v) => handlers.onUpdatePostEffectSetting('focalLength', v)),
          createSlider('ボケ', postEffects.bokehScale, POST_EFFECT_SLIDER_RANGES.bokehScale,
            (v) => handlers.onUpdatePostEffectSetting('bokehScale', v)),
        ],
      },

      // ------------------------------------------
      // ColorAverage（モノクロ化）
      // ------------------------------------------
      {
        name: 'ColorAverage',
        toggle: createToggle(postEffects, handlers, 'colorAverageEnabled'),
        sliders: [],
      },

      // ------------------------------------------
      // Pixelation（ピクセル化）
      // ------------------------------------------
      {
        name: 'Pixelation',
        toggle: createToggle(postEffects, handlers, 'pixelationEnabled'),
        sliders: [
          createSlider('粒度', postEffects.pixelationGranularity, POST_EFFECT_SLIDER_RANGES.pixelationGranularity,
            (v) => handlers.onUpdatePostEffectSetting('pixelationGranularity', v)),
        ],
      },

      // ------------------------------------------
      // DotScreen（網点効果）
      // ------------------------------------------
      {
        name: 'DotScreen',
        toggle: createToggle(postEffects, handlers, 'dotScreenEnabled'),
        sliders: [
          createSlider('スケール', postEffects.dotScreenScale, POST_EFFECT_SLIDER_RANGES.dotScreenScale,
            (v) => handlers.onUpdatePostEffectSetting('dotScreenScale', v)),
        ],
      },

      // ------------------------------------------
      // Glitch（グリッチ効果）
      // ------------------------------------------
      {
        name: 'Glitch',
        toggle: createToggle(postEffects, handlers, 'glitchEnabled'),
        sliders: [
          createTupleSlider(postEffects, handlers, '遅延(min)', 'glitchDelay', 0, GLITCH_SLIDER_RANGES.delay.min, 's'),
          createTupleSlider(postEffects, handlers, '遅延(max)', 'glitchDelay', 1, GLITCH_SLIDER_RANGES.delay.max, 's'),
          createTupleSlider(postEffects, handlers, '時間(min)', 'glitchDuration', 0, GLITCH_SLIDER_RANGES.duration.min, 's'),
          createTupleSlider(postEffects, handlers, '時間(max)', 'glitchDuration', 1, GLITCH_SLIDER_RANGES.duration.max, 's'),
          createTupleSlider(postEffects, handlers, '強度(弱)', 'glitchStrength', 0, GLITCH_SLIDER_RANGES.strength.weak),
          createTupleSlider(postEffects, handlers, '強度(強)', 'glitchStrength', 1, GLITCH_SLIDER_RANGES.strength.strong),
        ],
      },

      // ------------------------------------------
      // Cyberpunk（カスタムシェーダー効果）
      // ------------------------------------------
      {
        name: 'Cyberpunk',
        toggle: createToggle(postEffects, handlers, 'cyberpunkEnabled'),
        sliders: [
          createSlider('スキャンライン密度', postEffects.cyberpunkScanlineDensity, POST_EFFECT_SLIDER_RANGES.cyberpunkScanlineDensity,
            (v) => handlers.onUpdatePostEffectSetting('cyberpunkScanlineDensity', v)),
          createSlider('スキャンライン強度', postEffects.cyberpunkScanlineStrength, POST_EFFECT_SLIDER_RANGES.cyberpunkScanlineStrength,
            (v) => handlers.onUpdatePostEffectSetting('cyberpunkScanlineStrength', v)),
          createSlider('ノイズ強度', postEffects.cyberpunkNoiseStrength, POST_EFFECT_SLIDER_RANGES.cyberpunkNoiseStrength,
            (v) => handlers.onUpdatePostEffectSetting('cyberpunkNoiseStrength', v)),
          createSlider('RGBシフト', postEffects.cyberpunkRgbShiftStrength, POST_EFFECT_SLIDER_RANGES.cyberpunkRgbShiftStrength,
            (v) => handlers.onUpdatePostEffectSetting('cyberpunkRgbShiftStrength', v)),
        ],
      },
    ],
  }), [postEffects, handlers])
}
