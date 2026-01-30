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
  onBackgroundColorChange: (color: string) => void
  onLightAzimuthChange: (value: number) => void
  onLightElevationChange: (value: number) => void
  onLightDistanceChange: (value: number) => void
  onToggleDirectionalLight: () => void
  onDirectionalLightColorChange: (color: string) => void
  onDirectionalLightIntensityChange: (value: number) => void
  onHdriIndexChange: (index: number) => void
  onHdriRotationChange: (value: number) => void
  onHdriIntensityChange: (value: number) => void
  onToggleHdri: () => void
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
  const { checkboxes, background, hdri, light } = useControlPanel(settings, handlers)

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

      {/* 背景設定 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🎨 背景設定</h3>
        <div className={styles.colorPicker}>
          <label>
            <span>{background.label}</span>
            <input
              type="color"
              value={background.value}
              onChange={(e) => background.onChange(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* HDRI設定 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🌄 環境マップ</h3>

        {/* HDRI有効/無効 */}
        <label className={styles.control}>
          <input
            type="checkbox"
            checked={hdri.enabled.checked}
            onChange={hdri.enabled.onChange}
          />
          <span>{hdri.enabled.label}</span>
        </label>

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

        <div className={styles.slider}>
          <label>
            <span>{hdri.intensity.label}: {hdri.intensity.value.toFixed(1)}</span>
            <input
              type="range"
              min={hdri.intensity.min}
              max={hdri.intensity.max}
              step={hdri.intensity.step}
              value={hdri.intensity.value}
              onChange={(e) => hdri.intensity.onChange(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* ライト設定 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>💡 ライト設定</h3>

        {/* ライト有効/無効 */}
        <label className={styles.control}>
          <input
            type="checkbox"
            checked={light.enabled.checked}
            onChange={light.enabled.onChange}
          />
          <span>{light.enabled.label}</span>
        </label>

        {/* ライト色 */}
        <div className={styles.colorPicker}>
          <label>
            <span>{light.color.label}</span>
            <input
              type="color"
              value={light.color.value}
              onChange={(e) => light.color.onChange(e.target.value)}
            />
          </label>
        </div>

        {/* ライト強度 */}
        <div className={styles.slider}>
          <label>
            <span>{light.intensity.label}: {light.intensity.value.toFixed(1)}</span>
            <input
              type="range"
              min={light.intensity.min}
              max={light.intensity.max}
              step={light.intensity.step}
              value={light.intensity.value}
              onChange={(e) => light.intensity.onChange(Number(e.target.value))}
            />
          </label>
        </div>

        {/* 方位角/仰角/距離 */}
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
