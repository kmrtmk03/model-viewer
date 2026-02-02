/**
 * コントロールパネルコンポーネント
 * @description ビューアー設定UIを描画（ビュー専念）
 * 
 * アコーディオン形式で各セクションを折りたたみ可能にし、
 * パネルの長さを調整可能にする。
 * 
 * セクション構成:
 * 1. 表示設定 - グリッド、ワイヤーフレーム等のトグル
 * 2. 背景設定 - 背景モードと色の選択
 * 3. 環境マップ - HDRI選択と回転、強度調整
 * 4. ライト設定 - ライト色、強度、位置の調整
 * 5. ポストエフェクト - 各種エフェクトのトグルとパラメータ
 */

import type { FC } from 'react'
import type { ViewerSettings } from '../../types'
import { useControlPanel, type ControlPanelHandlers } from '../../hooks'
import { Accordion } from '../../../../components/Accordion'
import { SliderControl, CheckboxControl } from './components'
import styles from './ControlPanel.module.sass'

// ============================================
// 型定義
// ============================================

interface ControlPanelProps {
  /** ビューアー設定 */
  settings: ViewerSettings
  /** ハンドラー */
  handlers: ControlPanelHandlers
}

// ============================================
// コンポーネント
// ============================================

/**
 * コントロールパネル（ビュー専念）
 * 
 * ロジックはuseControlPanelフックで処理。
 * 各セクションはアコーディオン形式で折りたたみ可能。
 * UIはSliderControl、CheckboxControlコンポーネントを再利用。
 * 
 * @param props - コンポーネントProps
 * @returns コントロールパネルUI
 */
export const ControlPanel: FC<ControlPanelProps> = ({ settings, handlers }) => {
  // フックから設定を取得
  const { checkboxes, background, hdri, light, postEffects } = useControlPanel(settings, handlers)

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>コントロール</h2>

      {/* ============================================ */}
      {/* 表示設定セクション */}
      {/* グリッド、ワイヤーフレーム等の表示トグル */}
      {/* ============================================ */}
      <Accordion title="🎮 表示設定" defaultOpen={true}>
        <div className={styles.controls}>
          {checkboxes.map((checkbox) => (
            <CheckboxControl
              key={checkbox.label}
              label={checkbox.label}
              checked={checkbox.checked}
              onChange={checkbox.onChange}
            />
          ))}
        </div>
      </Accordion>

      {/* ============================================ */}
      {/* 背景設定セクション */}
      {/* 背景モード（透明/単色）と色の選択 */}
      {/* ============================================ */}
      <Accordion title="🎨 背景設定" defaultOpen={false}>
        {/* 背景モード選択（ラジオボタン） */}
        <div className={styles.radioGroup}>
          <span className={styles.label}>{background.mode.label}:</span>
          <div className={styles.options}>
            {background.mode.options.map((option) => (
              <label key={option.value} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="backgroundMode"
                  value={option.value}
                  checked={background.mode.value === option.value}
                  onChange={() => background.mode.onChange(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 背景色（Colorモード時のみ表示） */}
        {background.mode.value === 'color' && (
          <div className={styles.colorPicker}>
            <label>
              <span>{background.color.label}</span>
              <input
                type="color"
                value={background.color.value}
                onChange={(e) => background.color.onChange(e.target.value)}
              />
            </label>
          </div>
        )}
      </Accordion>

      {/* ============================================ */}
      {/* 環境マップ（HDRI）セクション */}
      {/* HDRI選択、回転、強度の調整 */}
      {/* ============================================ */}
      <Accordion title="🌄 環境マップ" defaultOpen={false}>
        {/* HDRI有効/無効トグル */}
        <CheckboxControl
          label={hdri.enabled.label}
          checked={hdri.enabled.checked}
          onChange={hdri.enabled.onChange}
        />

        {/* HDRI選択ドロップダウン */}
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

        {/* HDRI回転スライダー */}
        <SliderControl
          label={hdri.rotation.label}
          value={hdri.rotation.value}
          min={hdri.rotation.min}
          max={hdri.rotation.max}
          unit={hdri.rotation.unit}
          onChange={hdri.rotation.onChange}
        />

        {/* HDRI強度スライダー */}
        <SliderControl
          label={hdri.intensity.label}
          value={hdri.intensity.value}
          min={hdri.intensity.min}
          max={hdri.intensity.max}
          step={hdri.intensity.step}
          decimals={1}
          onChange={hdri.intensity.onChange}
        />
      </Accordion>

      {/* ============================================ */}
      {/* ライト設定セクション */}
      {/* ライト色、強度、位置（球面座標）の調整 */}
      {/* ============================================ */}
      <Accordion title="💡 ライト設定" defaultOpen={false}>
        {/* ライト有効/無効トグル */}
        <CheckboxControl
          label={light.enabled.label}
          checked={light.enabled.checked}
          onChange={light.enabled.onChange}
        />

        {/* ライト色ピッカー */}
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

        {/* ライト強度スライダー */}
        <SliderControl
          label={light.intensity.label}
          value={light.intensity.value}
          min={light.intensity.min}
          max={light.intensity.max}
          step={light.intensity.step}
          decimals={1}
          onChange={light.intensity.onChange}
        />

        {/* 方位角/仰角/距離スライダー */}
        {[light.azimuth, light.elevation, light.distance].map((slider) => (
          <SliderControl
            key={slider.label}
            label={slider.label}
            value={slider.value}
            min={slider.min}
            max={slider.max}
            unit={slider.unit}
            onChange={slider.onChange}
          />
        ))}
      </Accordion>

      {/* ============================================ */}
      {/* ポストエフェクトセクション */}
      {/* 各種エフェクトのトグルとパラメータ調整 */}
      {/* ============================================ */}
      <Accordion title="✨ ポストエフェクト" defaultOpen={false}>
        {/* エフェクトトグル */}
        <div className={styles.controls}>
          {postEffects.toggles.map((toggle) => (
            <CheckboxControl
              key={toggle.label}
              label={toggle.label}
              checked={toggle.checked}
              onChange={toggle.onChange}
            />
          ))}
        </div>

        {/* エフェクトパラメータスライダー */}
        {postEffects.sliders.map((slider) => (
          <SliderControl
            key={slider.label}
            label={slider.label}
            value={slider.value}
            min={slider.min}
            max={slider.max}
            step={slider.step}
            decimals={2}
            onChange={slider.onChange}
          />
        ))}
      </Accordion>

      {/* ============================================ */}
      {/* 設定リセットボタン */}
      {/* ============================================ */}
      <button className={styles.resetButton} onClick={handlers.onReset}>
        設定リセット
      </button>
    </div>
  )
}



