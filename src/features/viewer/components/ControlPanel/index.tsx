/**
 * コントロールパネルコンポーネント
 * @description ビューアー設定UIを描画（ビュー専念）
 */

import type { FC } from 'react'
import type { ViewerSettings } from '../../types'
import { useControlPanel } from '../../hooks'
import styles from './ControlPanel.module.sass'

/**
 * ハンドラー関数の型
 */
interface ControlPanelHandlers {
  onToggleWireframe: () => void
  onToggleGrid: () => void
  onToggleAxes: () => void
  onToggleAutoRotate: () => void
  onLightAzimuthChange: (value: number) => void
  onLightElevationChange: (value: number) => void
  onLightDistanceChange: (value: number) => void
  onHdriIndexChange: (index: number) => void
  onHdriRotationChange: (value: number) => void
  onReset: () => void
}

interface ControlPanelProps {
  /** ビューアー設定 */
  settings: ViewerSettings
  /** ハンドラー */
  handlers: ControlPanelHandlers
}

/**
 * コントロールパネル（ビュー専念）
 * ロジックはuseControlPanelフックで処理
 */
export const ControlPanel: FC<ControlPanelProps> = ({ settings, handlers }) => {
  // フックから設定を取得
  const { checkboxes, hdri, light } = useControlPanel(settings, handlers)

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>コントロール</h2>

      {/* チェックボックス群 */}
      <div className={styles.controls}>
        {checkboxes.map((checkbox) => (
          <label key={checkbox.label} className={styles.control}>
            <input
              type="checkbox"
              checked={checkbox.checked}
              onChange={checkbox.onChange}
            />
            <span>{checkbox.label}</span>
          </label>
        ))}
      </div>

      {/* HDRI設定 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🌄 環境マップ</h3>

        <div className={styles.select}>
          <label>
            <span>{hdri.select.label}</span>
            <select
              value={hdri.select.value}
              onChange={(e) => hdri.select.onChange(Number(e.target.value))}
            >
              {hdri.select.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.slider}>
          <label>
            <span>{hdri.rotation.label}: {hdri.rotation.value}{hdri.rotation.unit}</span>
            <input
              type="range"
              min={hdri.rotation.min}
              max={hdri.rotation.max}
              value={hdri.rotation.value}
              onChange={(e) => hdri.rotation.onChange(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* ライト設定 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>💡 ライト設定</h3>

        {[light.azimuth, light.elevation, light.distance].map((slider) => (
          <div key={slider.label} className={styles.slider}>
            <label>
              <span>{slider.label}: {slider.value}{slider.unit || ''}</span>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                value={slider.value}
                onChange={(e) => slider.onChange(Number(e.target.value))}
              />
            </label>
          </div>
        ))}
      </div>

      {/* リセット */}
      <button className={styles.resetButton} onClick={handlers.onReset}>
        設定リセット
      </button>
    </div>
  )
}
