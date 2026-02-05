/**
 * 設定エクスポート/インポート用フック
 * @description ViewerSettingsのJSONエクスポート/インポート機能を提供
 * 
 * 機能:
 * - exportSettings: 現在の設定をJSONファイルとしてダウンロード
 * - importSettings: JSONファイルから設定を読み込み
 * - validateSettings: インポートデータの型チェック
 */

import { useCallback, useRef } from 'react'
import type { ViewerSettings, PostEffectSettings } from '../types'

// ==========================================
// 型定義
// ==========================================

/**
 * エクスポートファイルの形式
 * @description JSONファイルに含まれるメタデータと設定
 */
interface SettingsExportData {
  /** ファイル形式のバージョン */
  version: string
  /** エクスポート日時（ISO 8601形式） */
  exportedAt: string
  /** ビューアー設定 */
  settings: ViewerSettings
}

/**
 * フックの戻り値の型
 */
interface UseSettingsIOReturn {
  /** 設定をJSONファイルとしてエクスポート */
  exportSettings: () => void
  /** JSONファイルから設定をインポート（ファイル選択ダイアログを開く） */
  triggerImport: () => void
  /** 隠しinput要素のref */
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

// ==========================================
// 定数
// ==========================================

/** エクスポートファイルのバージョン */
const EXPORT_VERSION = '1.0'

/** エクスポートファイル名のプレフィックス */
const FILE_NAME_PREFIX = 'model-viewer-settings'

// ==========================================
// バリデーション関数
// ==========================================

/**
 * PostEffectSettingsの型チェック
 * @param obj - チェック対象オブジェクト
 * @returns 正しいPostEffectSettingsであればtrue
 */
const isValidPostEffectSettings = (obj: unknown): obj is PostEffectSettings => {
  if (typeof obj !== 'object' || obj === null) return false
  
  const settings = obj as Record<string, unknown>
  
  // 必須のブール値プロパティ
  const booleanKeys = [
    'bloomEnabled', 'vignetteEnabled', 'toneMappingEnabled',
    'smaaEnabled', 'hueSaturationEnabled', 'depthOfFieldEnabled',
    'colorAverageEnabled', 'pixelationEnabled', 'dotScreenEnabled',
    'glitchEnabled', 'cyberpunkEnabled'
  ]
  
  for (const key of booleanKeys) {
    if (typeof settings[key] !== 'boolean') return false
  }
  
  // 必須の数値プロパティ
  const numberKeys = [
    'bloomIntensity', 'bloomThreshold',
    'vignetteOffset', 'vignetteDarkness',
    'hue', 'saturation',
    'focusDistance', 'focalLength', 'bokehScale',
    'pixelationGranularity', 'dotScreenScale',
    'cyberpunkScanlineDensity', 'cyberpunkScanlineStrength',
    'cyberpunkNoiseStrength', 'cyberpunkRgbShiftStrength'
  ]
  
  for (const key of numberKeys) {
    if (typeof settings[key] !== 'number') return false
  }
  
  // タプル型の配列プロパティ
  const tupleKeys = ['glitchDelay', 'glitchDuration', 'glitchStrength']
  for (const key of tupleKeys) {
    const arr = settings[key]
    if (!Array.isArray(arr) || arr.length !== 2) return false
    if (typeof arr[0] !== 'number' || typeof arr[1] !== 'number') return false
  }
  
  return true
}

/**
 * ViewerSettingsの型チェック
 * @param obj - チェック対象オブジェクト
 * @returns 正しいViewerSettingsであればtrue
 */
const isValidViewerSettings = (obj: unknown): obj is ViewerSettings => {
  if (typeof obj !== 'object' || obj === null) return false
  
  const settings = obj as Record<string, unknown>
  
  // ブール値プロパティ
  const booleanKeys = [
    'wireframe', 'showGrid', 'showAxes', 'autoRotate',
    'directionalLightEnabled', 'hdriEnabled'
  ]
  for (const key of booleanKeys) {
    if (typeof settings[key] !== 'boolean') return false
  }
  
  // 文字列プロパティ
  const stringKeys = ['backgroundColor', 'directionalLightColor']
  for (const key of stringKeys) {
    if (typeof settings[key] !== 'string') return false
  }
  
  // 数値プロパティ
  const numberKeys = [
    'lightAzimuth', 'lightElevation', 'lightDistance',
    'directionalLightIntensity', 'hdriIndex', 'hdriRotation', 'hdriIntensity'
  ]
  for (const key of numberKeys) {
    if (typeof settings[key] !== 'number') return false
  }
  
  // backgroundModeの列挙値チェック
  if (settings.backgroundMode !== 'color' && settings.backgroundMode !== 'hdri') {
    return false
  }
  
  // PostEffectSettingsのチェック
  if (!isValidPostEffectSettings(settings.postEffects)) {
    return false
  }
  
  return true
}

/**
 * エクスポートデータの型チェック
 * @param obj - チェック対象オブジェクト
 * @returns 正しいSettingsExportDataであればtrue
 */
const isValidExportData = (obj: unknown): obj is SettingsExportData => {
  if (typeof obj !== 'object' || obj === null) return false
  
  const data = obj as Record<string, unknown>
  
  if (typeof data.version !== 'string') return false
  if (typeof data.exportedAt !== 'string') return false
  if (!isValidViewerSettings(data.settings)) return false
  
  return true
}

// ==========================================
// フック本体
// ==========================================

/**
 * 設定エクスポート/インポートフック
 * 
 * @param settings - 現在のビューアー設定
 * @param onImport - インポート成功時のコールバック
 * @param onError - エラー発生時のコールバック（省略可）
 * @returns エクスポート/インポート関数とファイル入力のref
 * 
 * @example
 * ```tsx
 * const { exportSettings, triggerImport, fileInputRef } = useSettingsIO(
 *   settings,
 *   (newSettings) => setSettings(newSettings),
 *   (error) => console.error(error)
 * )
 * ```
 */
export const useSettingsIO = (
  settings: ViewerSettings,
  onImport: (settings: ViewerSettings) => void,
  onError?: (message: string) => void
): UseSettingsIOReturn => {
  // 隠しファイル入力要素のref
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // ------------------------------------------
  // エクスポート処理
  // ------------------------------------------
  const exportSettings = useCallback(() => {
    // エクスポートデータを構築
    const exportData: SettingsExportData = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      settings,
    }

    // JSONに変換（読みやすいようにインデント）
    const jsonString = JSON.stringify(exportData, null, 2)
    
    // Blobを作成
    const blob = new Blob([jsonString], { type: 'application/json' })
    
    // ダウンロードリンクを生成
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    // ファイル名を生成（タイムスタンプ付き）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    link.download = `${FILE_NAME_PREFIX}-${timestamp}.json`
    link.href = url
    
    // クリックしてダウンロード
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // URLを解放
    URL.revokeObjectURL(url)
  }, [settings])

  // ------------------------------------------
  // インポート処理
  // ------------------------------------------
  const handleFileChange = useCallback((event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    
    if (!file) return
    
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsed = JSON.parse(content)
        
        // 型チェック
        if (!isValidExportData(parsed)) {
          throw new Error('無効なファイル形式です。正しい設定ファイルを選択してください。')
        }
        
        // バージョン互換性チェック（将来の拡張用）
        if (parsed.version !== EXPORT_VERSION) {
          console.warn(`設定ファイルのバージョン(${parsed.version})が異なりますが、読み込みを試みます。`)
        }
        
        // 設定を適用
        onImport(parsed.settings)
        
      } catch (error) {
        const message = error instanceof Error 
          ? error.message 
          : '設定ファイルの読み込みに失敗しました。'
        
        if (onError) {
          onError(message)
        } else {
          console.error('Import error:', message)
          alert(message)
        }
      }
    }
    
    reader.onerror = () => {
      const message = 'ファイルの読み込み中にエラーが発生しました。'
      if (onError) {
        onError(message)
      } else {
        console.error('FileReader error')
        alert(message)
      }
    }
    
    reader.readAsText(file)
    
    // 同じファイルを再選択できるように値をリセット
    input.value = ''
  }, [onImport, onError])

  // ファイル選択ダイアログを開く
  const triggerImport = useCallback(() => {
    if (fileInputRef.current) {
      // イベントリスナーを設定
      fileInputRef.current.addEventListener('change', handleFileChange, { once: true })
      fileInputRef.current.click()
    }
  }, [handleFileChange])

  return {
    exportSettings,
    triggerImport,
    fileInputRef,
  }
}
