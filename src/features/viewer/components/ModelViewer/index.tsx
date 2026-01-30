/**
 * メイン3Dモデルビューアーコンポーネント
 * @description R3Fを使用した3Dモデル表示ビューアー（ビュー専念）
 */

import type { FC } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useModelViewer, useModelLoader } from '../../hooks'
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
    setBackgroundColor,
    setLightAzimuth,
    setLightElevation,
    setLightDistance,
    toggleDirectionalLight,
    setDirectionalLightColor,
    setDirectionalLightIntensity,
    setHdriIndex,
    setHdriRotation,
    setHdriIntensity,
    toggleHdri,
    resetSettings,
  } = useModelViewer()

  // モデルローダーフック
  const {
    loadedModel,
    modelObject,
    isLoading,
    error,
    isDragging,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearModel,
  } = useModelLoader()

  // ControlPanel用ハンドラーをまとめる
  const handlers = {
    onToggleWireframe: toggleWireframe,
    onToggleGrid: toggleGrid,
    onToggleAxes: toggleAxes,
    onToggleAutoRotate: toggleAutoRotate,
    onBackgroundColorChange: setBackgroundColor,
    onLightAzimuthChange: setLightAzimuth,
    onLightElevationChange: setLightElevation,
    onLightDistanceChange: setLightDistance,
    onToggleDirectionalLight: toggleDirectionalLight,
    onDirectionalLightColorChange: setDirectionalLightColor,
    onDirectionalLightIntensityChange: setDirectionalLightIntensity,
    onHdriIndexChange: setHdriIndex,
    onHdriRotationChange: setHdriRotation,
    onHdriIntensityChange: setHdriIntensity,
    onToggleHdri: toggleHdri,
    onReset: resetSettings,
  }

  return (
    <div
      className={styles.container}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
        <Model settings={settings} externalModel={modelObject} />

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

      {/* ドラッグオーバーレイ */}
      {isDragging && (
        <div className={styles.dropOverlay}>
          <div className={styles.dropContent}>
            <span className={styles.dropIcon}>📁</span>
            <span>FBX / GLB ファイルをドロップ</span>
          </div>
        </div>
      )}

      {/* ローディング表示 */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <span className={styles.loadingSpinner}>⏳</span>
            <span>モデルを読み込み中...</span>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className={styles.errorMessage}>
          <span>❌ {error}</span>
        </div>
      )}

      {/* 読み込み済みモデル情報 */}
      {loadedModel && (
        <div className={styles.modelInfo}>
          <span>📦 {loadedModel.name}</span>
          <button onClick={clearModel} className={styles.clearButton}>✕</button>
        </div>
      )}

      {/* コントロールパネル */}
      <ControlPanel settings={settings} handlers={handlers} />

      {/* 操作ヒント */}
      <div className={styles.hint}>
        🖱️ 左ドラッグ: 回転 / 右ドラッグ: パン / スクロール: ズーム / ファイルドロップ: モデル読み込み
      </div>
    </div>
  )
}
