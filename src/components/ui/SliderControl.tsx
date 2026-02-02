/**
 * スライダーコントロールコンポーネント
 * @description 再利用可能なスライダーUI
 */

import type { FC } from 'react'
import styles from './Controls.module.sass'

interface SliderControlProps {
  /** ラベルテキスト */
  label: string
  /** 現在値 */
  value: number
  /** 最小値 */
  min: number
  /** 最大値 */
  max: number
  /** 変更ハンドラー */
  onChange: (value: number) => void
  /** 単位（オプション） */
  unit?: string
}

/**
 * スライダーコントロール
 */
export const SliderControl: FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  onChange,
  unit = '',
}) => {
  return (
    <div className={styles.slider}>
      <label>
        <span>{label}: {value}{unit}</span>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </label>
    </div>
  )
}
