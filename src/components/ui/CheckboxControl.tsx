/**
 * チェックボックスコントロールコンポーネント
 * @description 再利用可能なチェックボックスUI
 */

import type { FC } from 'react'
import styles from './Controls.module.sass'

interface CheckboxControlProps {
  /** ラベルテキスト */
  label: string
  /** チェック状態 */
  checked: boolean
  /** 変更ハンドラー */
  onChange: () => void
}

/**
 * チェックボックスコントロール
 */
export const CheckboxControl: FC<CheckboxControlProps> = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <label className={styles.checkbox}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  )
}
