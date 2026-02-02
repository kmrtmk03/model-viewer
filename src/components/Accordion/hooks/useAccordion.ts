/**
 * アコーディオン開閉ロジックのカスタムフック
 * @description アコーディオンの開閉状態管理をビューから分離
 * 
 * @example
 * ```tsx
 * const { isOpen, toggle } = useAccordion(false)
 * 
 * return (
 *   <button onClick={toggle}>
 *     {isOpen ? '閉じる' : '開く'}
 *   </button>
 * )
 * ```
 */

import { useState, useCallback } from 'react'

/**
 * useAccordionフックの戻り値
 */
interface UseAccordionReturn {
  /** 現在の開閉状態 */
  isOpen: boolean
  /** 開閉をトグルするハンドラー */
  toggle: () => void
}

/**
 * アコーディオン開閉ロジック
 * 
 * 開閉状態の管理とトグルハンドラーを提供。
 * useCallbackでメモ化し、不要な再レンダリングを防止。
 * 
 * @param defaultOpen - 初期状態（デフォルト: false = 閉じた状態）
 * @returns 開閉状態とトグルハンドラー
 */
export const useAccordion = (defaultOpen: boolean = false): UseAccordionReturn => {
  // 開閉状態
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // トグルハンドラー（メモ化）
  // 依存配列が空なのでコンポーネントのライフサイクル中は同一参照を保持
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return { isOpen, toggle }
}
