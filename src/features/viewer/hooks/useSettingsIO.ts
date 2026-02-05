/**
 * 設定エクスポート/インポート用フック
 * @module useSettingsIO
 * @description ViewerSettingsのJSONエクスポート/インポート機能を提供
 * 
 * ## 機能概要
 * - **exportSettings**: 現在の設定をJSONファイルとしてダウンロード
 * - **triggerImport**: ファイル選択ダイアログを開いてJSONから設定を読み込み
 * 
 * ## 使用例
 * ```tsx
 * const { exportSettings, triggerImport, fileInputRef } = useSettingsIO(
 *   settings,
 *   (newSettings) => setSettings(newSettings)
 * )
 * 
 * return (
 *   <>
 *     <button onClick={exportSettings}>エクスポート</button>
 *     <button onClick={triggerImport}>インポート</button>
 *     <input ref={fileInputRef} type="file" hidden />
 *   </>
 * )
 * ```
 */

import { useCallback, useRef } from 'react'
import type { ViewerSettings } from '../types'
import { isValidExportData, type SettingsExportData } from './settingsValidator'

// ==========================================
// 型定義
// ==========================================

/**
 * フックの戻り値の型
 */
interface UseSettingsIOReturn {
  /** 設定をJSONファイルとしてエクスポート */
  exportSettings: () => void
  /** JSONファイルから設定をインポート（ファイル選択ダイアログを開く） */
  triggerImport: () => void
  /** 隠しinput要素のref（コンポーネント側で配置） */
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

// ==========================================
// 定数
// ==========================================

/** 
 * エクスポートファイルのバージョン
 * @description 将来的な互換性チェックに使用
 */
const EXPORT_VERSION = '1.0'

/** 
 * エクスポートファイル名のプレフィックス 
 * @description ダウンロード時のファイル名に使用
 */
const FILE_NAME_PREFIX = 'model-viewer-settings'

// ==========================================
// フック本体
// ==========================================

/**
 * 設定エクスポート/インポートフック
 * 
 * @param settings - 現在のビューアー設定
 * @param onImport - インポート成功時のコールバック（設定を受け取る）
 * @param onError - エラー発生時のコールバック（省略可、省略時はconsole.errorのみ）
 * @returns エクスポート/インポート関数とファイル入力のref
 */
export const useSettingsIO = (
  settings: ViewerSettings,
  onImport: (settings: ViewerSettings) => void,
  onError?: (message: string) => void
): UseSettingsIOReturn => {

  // 隠しファイル入力要素のref
  // コンポーネント側で <input ref={fileInputRef} /> として配置
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // ------------------------------------------
  // エクスポート処理
  // ------------------------------------------

  /**
   * 現在の設定をJSONファイルとしてダウンロード
   * 
   * 処理フロー:
   * 1. エクスポートデータ構築（バージョン、日時、設定）
   * 2. JSON文字列に変換（整形済み）
   * 3. Blob生成 → Object URL作成
   * 4. ダウンロードリンク生成・クリック
   * 5. メモリ解放（Object URL revoke）
   */
  const exportSettings = useCallback(() => {
    // Step 1: エクスポートデータを構築
    const exportData: SettingsExportData = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      settings,
    }

    // Step 2: JSONに変換（読みやすいようにインデント）
    const jsonString = JSON.stringify(exportData, null, 2)

    // Step 3: ダウンロード用のBlob/URLを作成
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // Step 4: ダウンロードリンクを生成・実行
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    link.download = `${FILE_NAME_PREFIX}-${timestamp}.json`
    link.href = url

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Step 5: メモリ解放
    URL.revokeObjectURL(url)

    console.log('[useSettingsIO] Settings exported successfully')
  }, [settings])

  // ------------------------------------------
  // インポート処理
  // ------------------------------------------

  /**
   * ファイル選択後のハンドラー
   * 
   * 処理フロー:
   * 1. 選択ファイルを取得
   * 2. FileReaderでテキストとして読み込み
   * 3. JSONパース
   * 4. バリデーション実行
   * 5. バージョン互換性チェック
   * 6. 設定適用（onImportコールバック）
   */
  const handleFileChange = useCallback((event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    // ファイルが選択されていない場合は終了
    if (!file) return

    const reader = new FileReader()

    // 読み込み完了時の処理
    reader.onload = (e) => {
      try {
        // Step 3: JSON文字列をパース
        const content = e.target?.result as string
        const parsed: unknown = JSON.parse(content)

        // Step 4: バリデーション実行
        if (!isValidExportData(parsed)) {
          throw new Error('無効なファイル形式です。正しい設定ファイルを選択してください。')
        }

        // Step 5: バージョン互換性チェック（将来の拡張用）
        if (parsed.version !== EXPORT_VERSION) {
          console.warn(
            `[useSettingsIO] バージョン不一致: ファイル=${parsed.version}, 期待値=${EXPORT_VERSION}`
          )
        }

        // Step 6: 設定を適用
        onImport(parsed.settings)
        console.log('[useSettingsIO] Settings imported successfully')

      } catch (error) {
        // エラーハンドリング
        const message = error instanceof Error
          ? error.message
          : '設定ファイルの読み込みに失敗しました。'

        console.error('[useSettingsIO] Import error:', message)

        // カスタムエラーハンドラーがあれば呼び出す
        if (onError) {
          onError(message)
        }
      }
    }

    // 読み込みエラー時の処理
    reader.onerror = () => {
      const message = 'ファイルの読み込み中にエラーが発生しました。'
      console.error('[useSettingsIO] FileReader error')

      if (onError) {
        onError(message)
      }
    }

    // Step 2: ファイルをテキストとして読み込み開始
    reader.readAsText(file)

    // 同じファイルを再選択できるように入力値をリセット
    input.value = ''
  }, [onImport, onError])

  /**
   * ファイル選択ダイアログを開く
   * 
   * 仕組み:
   * - 隠しinput要素にchange イベントリスナーを一度だけ設定
   * - input.click() でファイル選択ダイアログを表示
   */
  const triggerImport = useCallback(() => {
    if (fileInputRef.current) {
      // イベントリスナーを設定（once: trueで一度だけ発火）
      fileInputRef.current.addEventListener('change', handleFileChange, { once: true })
      fileInputRef.current.click()
    }
  }, [handleFileChange])

  // ------------------------------------------
  // 戻り値
  // ------------------------------------------

  return {
    exportSettings,
    triggerImport,
    fileInputRef,
  }
}
