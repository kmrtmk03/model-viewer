/**
 * 環境設定コンポーネント
 * @description ライティング、グリッド、軸ヘルパー、背景を描画（ビュー専念）
 */

import type { FC } from 'react'
import { useThree } from '@react-three/fiber'
import { Grid, GizmoHelper, GizmoViewport, Environment as DreiEnvironment } from '@react-three/drei'
import type { ViewerSettings } from '../types'
import { useEnvironment, useBackgroundEffect } from '../hooks'

interface EnvironmentProps {
  /** ビューアー設定 */
  settings: ViewerSettings
}

/**
 * 3Dシーンの環境設定コンポーネント（ビュー専念）
 * ロジックはuseEnvironmentフックで処理
 */
export const Environment: FC<EnvironmentProps> = ({ settings }) => {
  const { scene } = useThree()
  // フックから計算済みの値を取得
  const {
    lightPosition,
    lightEnabled,
    lightColor,
    lightIntensity,
    hdriPath,
    hdriRotationRad,
    hdriIntensity,
    hdriEnabled,
    gridConfig,
    showGrid,
    showAxes,
    backgroundColor,
    backgroundMode,
  } = useEnvironment(settings)

  // 背景エフェクト（副作用）を適用
  useBackgroundEffect({
    scene,
    backgroundMode,
    backgroundColor,
  })

  return (
    <>
      {/* HDRI環境マップ */}
      {hdriEnabled && (
        <DreiEnvironment
          key={hdriPath}
          files={hdriPath}
          background={backgroundMode === 'hdri'}
          environmentIntensity={hdriIntensity}
          environmentRotation={[0, hdriRotationRad, 0]}
        />
      )}

      {/* ディレクショナルライト */}
      {lightEnabled && (
        <directionalLight
          position={lightPosition}
          color={lightColor}
          intensity={lightIntensity}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
      )}

      {/* グリッド */}
      {showGrid && (
        <Grid
          args={[gridConfig.size, gridConfig.size]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor={gridConfig.subColor}
          sectionSize={1}
          sectionThickness={1}
          sectionColor={gridConfig.mainColor}
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
      )}

      {/* 軸ヘルパー */}
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
