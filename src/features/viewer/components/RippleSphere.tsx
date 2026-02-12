/**
 * ボコボコ変形エフェクト付き球体コンポーネント
 * @description
 * funtech.inc の球体を参考にした、クリックで表面がボコボコ変形するインタラクティブな球体。
 *
 * 機能:
 * - 画面中央に大きく表示される球体
 * - クリック時にノイズベースの全体変形が発生
 * - ダークなマット質感＋フレネルハイライト
 * - ゆっくりとした自動回転
 */

import { useRef, useMemo, type FC } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Vector3,
  SphereGeometry,
  type Mesh,
  FrontSide,
} from 'three'
import { vertexShader, fragmentShader } from '../shaders/rippleSphereShader'
import { useRippleEffect } from '../hooks/useRippleEffect'

// ============================
// 型定義
// ============================

interface RippleSphereProps {
  /** ポリゴン数変更通知コールバック */
  onPolygonCountChange?: (count: number) => void
  /** マテリアル一覧変更通知コールバック */
  onMaterialListChange?: (materials: string[]) => void
}

// ============================
// 定数
// ============================

/** 球体の半径 */
const SPHERE_RADIUS = 2.5

/** 球体のセグメント数（高解像度で滑らかな変形を実現） */
const SPHERE_SEGMENTS = 128

/** 自動回転速度 */
const ROTATION_SPEED = 0.08

/** ベースカラー（ダークブラウン / funtech風） */
const BASE_COLOR = new Vector3(0.6, 0.08, 0.08)

/** フレネルハイライト色 */
const FRESNEL_COLOR = new Vector3(0.8, 0.2, 0.2)

/** マテリアル名リスト */
const MATERIAL_LIST = ['RippleShaderMaterial']

/**
 * ボコボコ変形エフェクト付き球体コンポーネント
 */
export const RippleSphere: FC<RippleSphereProps> = ({
  onPolygonCountChange,
  onMaterialListChange,
}) => {
  const meshRef = useRef<Mesh>(null)

  // 変形エフェクトフック
  const { materialRef, triggerDeform } = useRippleEffect()

  // シェーダーのuniform定義
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAmplitude: { value: 0 },    // 変形の振幅（クリックで上昇、自動減衰）
    uFrequency: { value: 0.2 },  // ノイズの周波数（小さいほど大きく丸い変形）

    // マテリアル
    uBaseColor: { value: BASE_COLOR },
    uFresnelColor: { value: FRESNEL_COLOR },
    uFresnelPower: { value: 3.0 },
  }), [])

  // 球体ジオメトリ（メモ化してパフォーマンス最適化）
  const geometry = useMemo(() => {
    return new SphereGeometry(SPHERE_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS)
  }, [])

  // ポリゴン数・マテリアル情報の通知
  useMemo(() => {
    if (geometry) {
      const indexCount = geometry.index ? geometry.index.count : 0
      const triangleCount = indexCount / 3
      onPolygonCountChange?.(triangleCount)
    }
    onMaterialListChange?.(MATERIAL_LIST)
  }, [geometry, onPolygonCountChange, onMaterialListChange])

  // 自動回転アニメーション
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * ROTATION_SPEED
    }
  })

  /**
   * クリックイベントハンドラー
   * クリック位置に関係なく球体全体の変形をトリガー
   */
  const handleClick = () => {
    triggerDeform()
  }

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onClick={handleClick}
      castShadow
      receiveShadow
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={FrontSide}
      />
    </mesh>
  )
}
