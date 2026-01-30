/**
 * メイン3Dモデルビューアーコンポーネント
 * @description R3Fを使用した3Dモデル表示ビューアー
 */

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useModelViewer } from '@/hooks/useModelViewer'
import { DEFAULT_CAMERA_SETTINGS } from '@/constants/viewer'
import { Environment } from './Environment'
import { Model } from './Model'
import { ControlPanel } from './ControlPanel'
import styles from './ModelViewer.module.sass'

/**
 * 3Dモデルビューアーコンポーネント
 * カメラコントロール、ライティング、グリッドを含む完全なビューアー
 */
export const ModelViewer = () => {
  // ビューアー設定と操作関数を取得
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
        {/* 環境設定（ライト、グリッド、HDRI背景） */}
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
      <ControlPanel
        settings={settings}
        onToggleWireframe={toggleWireframe}
        onToggleGrid={toggleGrid}
        onToggleAxes={toggleAxes}
        onToggleAutoRotate={toggleAutoRotate}
        onLightAzimuthChange={setLightAzimuth}
        onLightElevationChange={setLightElevation}
        onLightDistanceChange={setLightDistance}
        onHdriIndexChange={setHdriIndex}
        onHdriRotationChange={setHdriRotation}
        onReset={resetSettings}
      />

      {/* 操作ヒント */}
      <div className={styles.hint}>
        🖱️ 左ドラッグ: 回転 / 右ドラッグ: パン / スクロール: ズーム
      </div>
    </div>
  )
}
