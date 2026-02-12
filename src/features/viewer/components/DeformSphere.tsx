/**
 * 変形エフェクト付き球体コンポーネント
 * @description
 * クリックで表面がボコボコと変形するインタラクティブな球体。
 *
 * 機能:
 * - 画面中央に大きく表示される高解像度球体
 * - クリック時にノイズベースの全体変形が発生し、時間経過で元に戻る
 * - カスタムシェーダーによるフレネルハイライト付きマット質感
 * - ゆっくりとした自動回転
 *
 * 構成:
 * - ビュー: このコンポーネント（描画のみ）
 * - ロジック: `useSphereDeform` フック（変形の状態管理）
 * - シェーダー: `deformSphereShader.ts`（GLSL定義）
 */

import { useRef, useMemo, useEffect, type FC } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Vector3,
  SphereGeometry,
  type Mesh,
  FrontSide,
} from 'three'
import { vertexShader, fragmentShader } from '../shaders/deformSphereShader'
import { useSphereDeform } from '../hooks/useSphereDeform'

// ============================
// 型定義
// ============================

interface DeformSphereProps {
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

/** ベースカラー（赤系） */
const BASE_COLOR = new Vector3(0.6, 0.08, 0.08)

/** フレネルハイライト色（赤系） */
const FRESNEL_COLOR = new Vector3(0.8, 0.2, 0.2)

/** マテリアル名リスト（情報パネル表示用） */
const MATERIAL_LIST = ['DeformShaderMaterial']

/**
 * 変形エフェクト付き球体コンポーネント
 */
export const DeformSphere: FC<DeformSphereProps> = ({
  onPolygonCountChange,
  onMaterialListChange,
}) => {
  const meshRef = useRef<Mesh>(null)

  // 変形エフェクトフック（ロジック分離）
  const { materialRef, triggerDeform } = useSphereDeform()

  // シェーダーのuniform定義（マウント時に一度だけ生成）
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAmplitude: { value: 0 },    // 変形の振幅（クリックで上昇、自動減衰）
    uFrequency: { value: 0.2 },  // ノイズの周波数（小さいほど大きく丸い変形）

    // マテリアルカラー
    uBaseColor: { value: BASE_COLOR },
    uFresnelColor: { value: FRESNEL_COLOR },
    uFresnelPower: { value: 3.0 },
  }), [])

  // 球体ジオメトリ（メモ化してパフォーマンス最適化）
  const geometry = useMemo(() => {
    return new SphereGeometry(SPHERE_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS)
  }, [])

  // ポリゴン数・マテリアル情報の通知（副作用のため useEffect を使用）
  useEffect(() => {
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
