/**
 * セレクトコントロールコンポーネント
 * @description 再利用可能なセレクトボックスUI
 */

import type { FC } from 'react'
import styles from './Controls.module.sass'

interface SelectOption {
  /** 値 */
  value: number | string
  /** 表示ラベル */
  label: string
}

interface SelectControlProps {
  /** ラベルテキスト */
  label: string
  /** 現在値 */
  value: number | string
  /** 選択肢 */
  options: SelectOption[]
  /** 変更ハンドラー */
  onChange: (value: number | string) => void
}

/**
 * セレクトコントロール
 */
export const SelectControl: FC<SelectControlProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  return (
    <div className={styles.select}>
      <label>
        <span>{label}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
