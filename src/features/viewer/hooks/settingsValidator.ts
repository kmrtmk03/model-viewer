/**
 * 設定データバリデーション
 * @description JSONインポート時のランタイム型チェック関数を提供
 * 
 * ViewerSettingsとPostEffectSettingsの各プロパティを検証し、
 * 不正なデータがアプリケーションに読み込まれることを防ぐ。
 * 
 * @example
 * ```typescript
 * import { isValidExportData } from './settingsValidator'
 * 
 * const parsed = JSON.parse(jsonString)
 * if (isValidExportData(parsed)) {
 *   // parsed は SettingsExportData 型として安全に使用可能
 *   applySettings(parsed.settings)
 * }
 * ```
 */

import type { ViewerSettings, PostEffectSettings } from '../types'

// ==========================================
// エクスポートデータ型定義
// ==========================================

/**
 * エクスポートファイルの形式
 * @description JSONファイルに含まれるメタデータと設定
 */
export interface SettingsExportData {
  /** ファイル形式のバージョン（互換性チェック用） */
  version: string
  /** エクスポート日時（ISO 8601形式） */
  exportedAt: string
  /** ビューアー設定本体 */
  settings: ViewerSettings
}

// ==========================================
// バリデーションキー定義
// ==========================================

/**
 * PostEffectSettingsのブール値プロパティ一覧
 * @description 各エフェクトの有効/無効フラグ
 */
const POST_EFFECT_BOOLEAN_KEYS = [
  'bloomEnabled',
  'vignetteEnabled',
  'toneMappingEnabled',
  'smaaEnabled',
  'hueSaturationEnabled',
  'depthOfFieldEnabled',
  'colorAverageEnabled',
  'pixelationEnabled',
  'dotScreenEnabled',
  'glitchEnabled',
  'cyberpunkEnabled',
] as const

/**
 * PostEffectSettingsの数値プロパティ一覧
 * @description 各エフェクトのパラメータ値
 */
const POST_EFFECT_NUMBER_KEYS = [
  // Bloom
  'bloomIntensity',
  'bloomThreshold',
  // Vignette
  'vignetteOffset',
  'vignetteDarkness',
  // HueSaturation
  'hue',
  'saturation',
  // DepthOfField
  'focusDistance',
  'focalLength',
  'bokehScale',
  // Pixelation
  'pixelationGranularity',
  // DotScreen
  'dotScreenScale',
  // Cyberpunk
  'cyberpunkScanlineDensity',
  'cyberpunkScanlineStrength',
  'cyberpunkNoiseStrength',
  'cyberpunkRgbShiftStrength',
] as const

/**
 * PostEffectSettingsのタプル型プロパティ一覧
 * @description [最小値, 最大値] 形式のGlitch設定
 */
const POST_EFFECT_TUPLE_KEYS = [
  'glitchDelay',
  'glitchDuration',
  'glitchStrength',
] as const

/**
 * ViewerSettingsのブール値プロパティ一覧
 */
const VIEWER_BOOLEAN_KEYS = [
  'wireframe',
  'showGrid',
  'showAxes',
  'autoRotate',
  'directionalLightEnabled',
  'hdriEnabled',
] as const

/**
 * ViewerSettingsの文字列プロパティ一覧
 */
const VIEWER_STRING_KEYS = [
  'backgroundColor',
  'directionalLightColor',
] as const

/**
 * ViewerSettingsの数値プロパティ一覧
 */
const VIEWER_NUMBER_KEYS = [
  'lightAzimuth',
  'lightElevation',
  'lightDistance',
  'directionalLightIntensity',
  'hdriIndex',
  'hdriRotation',
  'hdriIntensity',
] as const

// ==========================================
// バリデーション関数
// ==========================================

/**
 * PostEffectSettingsの型チェック
 * 
 * ポストエフェクト設定の各プロパティを検証:
 * - ブール値: 各エフェクトの有効/無効フラグ
 * - 数値: 各エフェクトのパラメータ
 * - タプル: Glitchエフェクトの範囲指定
 * 
 * @param obj - チェック対象オブジェクト
 * @returns 正しいPostEffectSettingsであればtrue
 */
export const isValidPostEffectSettings = (obj: unknown): obj is PostEffectSettings => {
  // null/undefinedチェック
  if (typeof obj !== 'object' || obj === null) return false

  const settings = obj as Record<string, unknown>

  // ブール値プロパティの検証
  for (const key of POST_EFFECT_BOOLEAN_KEYS) {
    if (typeof settings[key] !== 'boolean') {
      console.warn(`[Validator] PostEffectSettings: ${key} should be boolean, got ${typeof settings[key]}`)
      return false
    }
  }

  // 数値プロパティの検証
  for (const key of POST_EFFECT_NUMBER_KEYS) {
    if (typeof settings[key] !== 'number') {
      console.warn(`[Validator] PostEffectSettings: ${key} should be number, got ${typeof settings[key]}`)
      return false
    }
  }

  // タプル型プロパティの検証（[number, number] 形式）
  for (const key of POST_EFFECT_TUPLE_KEYS) {
    const arr = settings[key]
    if (!Array.isArray(arr) || arr.length !== 2) {
      console.warn(`[Validator] PostEffectSettings: ${key} should be [number, number] array`)
      return false
    }
    if (typeof arr[0] !== 'number' || typeof arr[1] !== 'number') {
      console.warn(`[Validator] PostEffectSettings: ${key} elements should be numbers`)
      return false
    }
  }

  return true
}

/**
 * ViewerSettingsの型チェック
 * 
 * ビューアー設定の各プロパティを検証:
 * - ブール値: 表示オプション、有効/無効フラグ
 * - 文字列: 色設定（HEX形式）
 * - 数値: 位置、強度、角度などのパラメータ
 * - 列挙型: backgroundMode ('color' | 'hdri')
 * - ネスト: postEffects
 * 
 * @param obj - チェック対象オブジェクト
 * @returns 正しいViewerSettingsであればtrue
 */
export const isValidViewerSettings = (obj: unknown): obj is ViewerSettings => {
  // null/undefinedチェック
  if (typeof obj !== 'object' || obj === null) return false

  const settings = obj as Record<string, unknown>

  // ブール値プロパティの検証
  for (const key of VIEWER_BOOLEAN_KEYS) {
    if (typeof settings[key] !== 'boolean') {
      console.warn(`[Validator] ViewerSettings: ${key} should be boolean, got ${typeof settings[key]}`)
      return false
    }
  }

  // 文字列プロパティの検証
  for (const key of VIEWER_STRING_KEYS) {
    if (typeof settings[key] !== 'string') {
      console.warn(`[Validator] ViewerSettings: ${key} should be string, got ${typeof settings[key]}`)
      return false
    }
  }

  // 数値プロパティの検証
  for (const key of VIEWER_NUMBER_KEYS) {
    if (typeof settings[key] !== 'number') {
      console.warn(`[Validator] ViewerSettings: ${key} should be number, got ${typeof settings[key]}`)
      return false
    }
  }

  // backgroundModeの列挙値チェック
  if (settings.backgroundMode !== 'color' && settings.backgroundMode !== 'hdri') {
    console.warn(`[Validator] ViewerSettings: backgroundMode should be 'color' or 'hdri', got ${settings.backgroundMode}`)
    return false
  }

  // ネストされたPostEffectSettingsの検証
  if (!isValidPostEffectSettings(settings.postEffects)) {
    console.warn('[Validator] ViewerSettings: postEffects validation failed')
    return false
  }

  return true
}

/**
 * エクスポートデータの型チェック
 * 
 * JSONファイルから読み込んだデータが正しい形式かを検証:
 * - version: ファイル形式のバージョン文字列
 * - exportedAt: ISO 8601形式の日時文字列
 * - settings: ViewerSettings型のオブジェクト
 * 
 * @param obj - チェック対象オブジェクト
 * @returns 正しいSettingsExportDataであればtrue
 */
export const isValidExportData = (obj: unknown): obj is SettingsExportData => {
  // null/undefinedチェック
  if (typeof obj !== 'object' || obj === null) return false

  const data = obj as Record<string, unknown>

  // メタデータの検証
  if (typeof data.version !== 'string') {
    console.warn('[Validator] ExportData: version should be string')
    return false
  }
  if (typeof data.exportedAt !== 'string') {
    console.warn('[Validator] ExportData: exportedAt should be string')
    return false
  }

  // 設定データの検証
  if (!isValidViewerSettings(data.settings)) {
    console.warn('[Validator] ExportData: settings validation failed')
    return false
  }

  return true
}
