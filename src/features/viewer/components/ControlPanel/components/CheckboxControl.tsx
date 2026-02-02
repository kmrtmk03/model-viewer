/**
 * チェックボックスコントロールコンポーネント
 * @description ON/OFF切り替え用の再利用可能なチェックボックスUI
 * 
 * ラベルとチェックボックスを一体化したコントロール。
 * ControlPanel内の各種トグル操作に使用。
 * 
 * @example
 * ```tsx
 * <CheckboxControl
 *   label="グリッド表示"
 *   checked={showGrid}
 *   onChange={() => setShowGrid(!showGrid)}
 * />
 * ```
 */

import type { FC, ChangeEvent } from 'react'
import styles from '../ControlPanel.module.sass'

// ============================================
// 型定義
// ============================================

/**
 * CheckboxControlのprops
 */
interface CheckboxControlProps {
  /** チェックボックスのラベル */
  label: string
  /** チェック状態 */
  checked: boolean
  /** 状態変更時のハンドラー */
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

// ============================================
// コンポーネント
// ============================================

/**
 * チェックボックスコントロール
 * 
 * ビューに専念したプレゼンテーショナルコンポーネント。
 * クリック可能な領域はラベル全体に拡張。
 * 
 * @param props - コンポーネントProps
 * @returns チェックボックスUI
 */
export const CheckboxControl: FC<CheckboxControlProps> = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <label className={styles.control}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  )
}
