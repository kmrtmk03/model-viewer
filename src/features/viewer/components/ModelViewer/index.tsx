/**
 * メイン3Dモデルビューアーコンポーネント
 * @description R3Fを使用した3Dモデル表示ビューアー（ビュー専念）
 */

import type { FC } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useModelViewer } from '../../hooks'
import { DEFAULT_CAMERA_SETTINGS } from '../../constants'
import { Environment } from '../Environment'
import { Model } from '../Model'
import { ControlPanel } from '../ControlPanel'
import styles from './ModelViewer.module.sass'

/**
 * 3Dモデルビューアーコンポーネント（ビュー専念）
 */
export const ModelViewer: FC = () => {
  // フックから設定と操作関数を取得
  const {
    settings,
    toggleWireframe,
    toggleGrid,
    toggleAxes,
    toggleAutoRotate,
    setLightAzimuth,
    setLightElevation,
    setLightDistance,
    setHdriIndex,
    setHdriRotation,
    resetSettings,
  } = useModelViewer()

  // ControlPanel用ハンドラーをまとめる
  const handlers = {
    onToggleWireframe: toggleWireframe,
    onToggleGrid: toggleGrid,
    onToggleAxes: toggleAxes,
    onToggleAutoRotate: toggleAutoRotate,
    onLightAzimuthChange: setLightAzimuth,
    onLightElevationChange: setLightElevation,
    onLightDistanceChange: setLightDistance,
    onHdriIndexChange: setHdriIndex,
    onHdriRotationChange: setHdriRotation,
    onReset: resetSettings,
  }

  return (
    <div className={styles.container}>
      {/* 3Dキャンバス */}
      <Canvas
        className={styles.canvas}
        camera={{
          position: DEFAULT_CAMERA_SETTINGS.position,
          fov: DEFAULT_CAMERA_SETTINGS.fov,
          near: DEFAULT_CAMERA_SETTINGS.near,
          far: DEFAULT_CAMERA_SETTINGS.far,
        }}
        shadows
      >
        {/* 環境設定 */}
        <Environment settings={settings} />

        {/* 3Dモデル */}
        <Model settings={settings} />

        {/* カメラコントロール */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={50}
          makeDefault
        />
      </Canvas>

      {/* コントロールパネル */}
      <ControlPanel settings={settings} handlers={handlers} />

      {/* 操作ヒント */}
      <div className={styles.hint}>
        🖱️ 左ドラッグ: 回転 / 右ドラッグ: パン / スクロール: ズーム
      </div>
    </div>
  )
}
