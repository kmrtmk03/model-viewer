/**
 * スライダーコントロールコンポーネント
 * @description 数値調整用の再利用可能なスライダーUI
 * 
 * ラベル、現在値、スライダーを一体化したコントロール。
 * ControlPanel内の各種数値パラメータ調整に使用。
 * 
 * @example
 * ```tsx
 * <SliderControl
 *   label="強度"
 *   value={1.5}
 *   min={0}
 *   max={3}
 *   step={0.1}
 *   unit=""
 *   decimals={1}
 *   onChange={(v) => setIntensity(v)}
 * />
 * ```
 */

import type { FC, ChangeEvent } from 'react'
import styles from '../ControlPanel.module.sass'

// ============================================
// 型定義
// ============================================

/**
 * SliderControlのprops
 */
interface SliderControlProps {
  /** スライダーのラベル */
  label: string
  /** 現在の値 */
  value: number
  /** 最小値 */
  min: number
  /** 最大値 */
  max: number
  /** ステップ（省略可、デフォルト: 1） */
  step?: number
  /** 単位（例: "°", "%"） */
  unit?: string
  /** 表示小数点桁数（省略可） */
  decimals?: number
  /** 値変更時のハンドラー */
  onChange: (value: number) => void
}

// ============================================
// コンポーネント
// ============================================

/**
 * スライダーコントロール
 * 
 * ビューに専念したプレゼンテーショナルコンポーネント。
 * 値のフォーマットは decimals プロパティで制御。
 * 
 * @param props - コンポーネントProps
 * @returns スライダーUI
 */
export const SliderControl: FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  decimals,
  onChange,
}) => {
  // 表示用の値フォーマット
  const displayValue = decimals !== undefined
    ? value.toFixed(decimals)
    : value

  // イベントハンドラー
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  return (
    <div className={styles.slider}>
      <label>
        {/* ラベルと現在値 */}
        <span>{label}: {displayValue}{unit}</span>
        {/* スライダー */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
        />
      </label>
    </div>
  )
}
