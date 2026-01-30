/**
 * 環境設定コンポーネント
 * @description ライティング、グリッド、軸ヘルパー、HDRI環境光を管理
 */

import { useMemo } from 'react'
import { Grid, GizmoHelper, GizmoViewport, Environment as DreiEnvironment } from '@react-three/drei'
import type { ViewerSettings } from '@/types/model'
import { DEFAULT_LIGHTING_SETTINGS, GRID_CONFIG, HDRI_LIST } from '@/constants/viewer'

interface EnvironmentProps {
  /** ビューアー設定 */
  settings: ViewerSettings
}

/**
 * 角度（度）から3D位置を計算
 * @param azimuth 方位角（度）
 * @param elevation 仰角（度）
 * @param distance 距離
 * @returns [x, y, z] 位置
 */
const calculateLightPosition = (
  azimuth: number,
  elevation: number,
  distance: number
): [number, number, number] => {
  // 度をラジアンに変換
  const azimuthRad = (azimuth * Math.PI) / 180
  const elevationRad = (elevation * Math.PI) / 180

  // 球面座標からデカルト座標に変換
  const y = distance * Math.sin(elevationRad)
  const horizontalDistance = distance * Math.cos(elevationRad)
  const x = horizontalDistance * Math.cos(azimuthRad)
  const z = horizontalDistance * Math.sin(azimuthRad)

  return [x, y, z]
}

/**
 * 3Dシーンの環境設定コンポーネント
 * ライティング、グリッド、軸表示、背景色を管理
 */
export const Environment = ({ settings }: EnvironmentProps) => {
  const {
    showGrid,
    showAxes,
    backgroundColor,
    lightAzimuth,
    lightElevation,
    lightDistance,
    hdriIndex,
    hdriRotation,
  } = settings
  const { directionalIntensity } = DEFAULT_LIGHTING_SETTINGS

  // ライト位置を角度から計算（メモ化）
  const lightPosition = useMemo(
    () => calculateLightPosition(lightAzimuth, lightElevation, lightDistance),
    [lightAzimuth, lightElevation, lightDistance]
  )

  // 選択されたHDRIのパスを取得
  const hdriPath = HDRI_LIST[hdriIndex]?.path ?? HDRI_LIST[0].path

  // HDRI回転をラジアンに変換（Y軸回転）
  const hdriRotationRad = (hdriRotation * Math.PI) / 180

  return (
    <>
      {/* 背景色 - 単色のベタ塗り */}
      <color attach="background" args={[backgroundColor]} />

      {/* HDRI環境マップ - 環境光のみ使用（背景には表示しない） */}
      <DreiEnvironment
        key={hdriPath}
        files={hdriPath}
        background={false}
        environmentIntensity={0.5}
        environmentRotation={[0, hdriRotationRad, 0]}
      />

      {/* ディレクショナルライト - 太陽光のような平行光源 */}
      <directionalLight
        position={lightPosition}
        intensity={directionalIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* グリッド表示 */}
      {showGrid && (
        <Grid
          args={[GRID_CONFIG.size, GRID_CONFIG.size]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor={GRID_CONFIG.subColor}
          sectionSize={1}
          sectionThickness={1}
          sectionColor={GRID_CONFIG.mainColor}
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
      )}

      {/* 軸ヘルパー - 右下にギズモ表示 */}
      {showAxes && (
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={['#ff6b6b', '#51cf66', '#339af0']}
            labelColor="white"
          />
        </GizmoHelper>
      )}
    </>
  )
}
