/**
 * コントロールパネルコンポーネント
 * @description ビューアーの設定を操作するUI
 */

import type { FC } from 'react'
import type { ViewerSettings } from '@/types/model'
import { HDRI_LIST } from '@/constants/viewer'
import styles from './ControlPanel.module.sass'

interface ControlPanelProps {
  /** ビューアー設定 */
  settings: ViewerSettings
  /** ワイヤーフレーム切替 */
  onToggleWireframe: () => void
  /** グリッド切替 */
  onToggleGrid: () => void
  /** 軸表示切替 */
  onToggleAxes: () => void
  /** 自動回転切替 */
  onToggleAutoRotate: () => void
  /** ライト方位角変更 */
  onLightAzimuthChange: (value: number) => void
  /** ライト仰角変更 */
  onLightElevationChange: (value: number) => void
  /** ライト距離変更 */
  onLightDistanceChange: (value: number) => void
  /** HDRI変更 */
  onHdriIndexChange: (index: number) => void
  /** HDRI回転変更 */
  onHdriRotationChange: (value: number) => void
  /** 設定リセット */
  onReset: () => void
}

/**
 * ビューアー設定を操作するコントロールパネル
 */
export const ControlPanel: FC<ControlPanelProps> = ({
  settings,
  onToggleWireframe,
  onToggleGrid,
  onToggleAxes,
  onToggleAutoRotate,
  onLightAzimuthChange,
  onLightElevationChange,
  onLightDistanceChange,
  onHdriIndexChange,
  onHdriRotationChange,
  onReset,
}) => {
  const {
    wireframe,
    showGrid,
    showAxes,
    autoRotate,
    lightAzimuth,
    lightElevation,
    lightDistance,
    hdriIndex,
    hdriRotation,
  } = settings

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>コントロール</h2>

      <div className={styles.controls}>
        {/* ワイヤーフレーム */}
        <label className={styles.control}>
          <input
            type="checkbox"
            checked={wireframe}
            onChange={onToggleWireframe}
          />
          <span>ワイヤーフレーム</span>
        </label>

        {/* グリッド表示 */}
        <label className={styles.control}>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={onToggleGrid}
          />
          <span>グリッド</span>
        </label>

        {/* 軸表示 */}
        <label className={styles.control}>
          <input
            type="checkbox"
            checked={showAxes}
            onChange={onToggleAxes}
          />
          <span>軸ヘルパー</span>
        </label>

        {/* 自動回転 */}
        <label className={styles.control}>
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={onToggleAutoRotate}
          />
          <span>自動回転</span>
        </label>
      </div>

      {/* HDRI設定セクション */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🌄 環境マップ</h3>

        {/* HDRI選択 */}
        <div className={styles.select}>
          <label>
            <span>HDRI</span>
            <select
              value={hdriIndex}
              onChange={(e) => onHdriIndexChange(Number(e.target.value))}
            >
              {HDRI_LIST.map((hdri) => (
                <option key={hdri.id} value={hdri.id}>
                  {hdri.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* HDRI回転スライダー */}
        <div className={styles.slider}>
          <label>
            <span>回転: {hdriRotation}°</span>
            <input
              type="range"
              min={0}
              max={360}
              value={hdriRotation}
              onChange={(e) => onHdriRotationChange(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* ライト設定セクション */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>💡 ライト設定</h3>

        {/* 方位角スライダー */}
        <div className={styles.slider}>
          <label>
            <span>方位角: {lightAzimuth}°</span>
            <input
              type="range"
              min={0}
              max={360}
              value={lightAzimuth}
              onChange={(e) => onLightAzimuthChange(Number(e.target.value))}
            />
          </label>
        </div>

        {/* 仰角スライダー */}
        <div className={styles.slider}>
          <label>
            <span>仰角: {lightElevation}°</span>
            <input
              type="range"
              min={10}
              max={90}
              value={lightElevation}
              onChange={(e) => onLightElevationChange(Number(e.target.value))}
            />
          </label>
        </div>

        {/* 距離スライダー */}
        <div className={styles.slider}>
          <label>
            <span>距離: {lightDistance}</span>
            <input
              type="range"
              min={5}
              max={30}
              value={lightDistance}
              onChange={(e) => onLightDistanceChange(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* リセットボタン */}
      <button className={styles.resetButton} onClick={onReset}>
        設定リセット
      </button>
    </div>
  )
}
