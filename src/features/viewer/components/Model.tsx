/**
 * 3Dモデルコンポーネント
 * @description 外部モデルまたはサンプル3Dオブジェクトを表示（ビュー専念）
 *
 * このコンポーネントは以下の責務を持ちます:
 * - サンプル3Dモデルの表示（外部モデル未読み込み時）
 * - 外部GLB/FBXモデルの表示
 * - ワイヤーフレーム表示の切り替え
 * - 自動回転アニメーション
 * - ポリゴン数・マテリアル情報の親への通知
 */

import { useRef, useEffect, type FC } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  SphereGeometry,
  TorusGeometry,
  type BufferGeometry,
  type Mesh,
  type Group,
  type MeshStandardMaterial,
} from 'three'
import type { ViewerSettings } from '../types'
import {
  getTriangleCountFromGeometry,
  getTriangleCountFromObject,
  getMaterialListFromObject,
  isMesh,
} from '../utils/modelAnalyzer'

// ============================
// 型定義
// ============================

/**
 * Modelコンポーネントのprops
 */
interface ModelProps {
  /** ビューアー設定 */
  settings: ViewerSettings
  /** 外部から読み込まれた3Dモデル */
  externalModel?: Group | null
  /** ポリゴン数の更新通知コールバック */
  onPolygonCountChange?: (count: number) => void
  /** マテリアル一覧の更新通知コールバック */
  onMaterialListChange?: (materials: string[]) => void
}

/**
 * サンプルモデルの三角形数（構成ジオメトリから計算）
 */
const SAMPLE_TRIANGLE_COUNT = (() => {
  const geometries: BufferGeometry[] = [
    new BoxGeometry(1, 1, 1),
    new SphereGeometry(0.5, 32, 32),
    new TorusGeometry(0.4, 0.15, 16, 100),
    new ConeGeometry(0.5, 1, 32),
    new CylinderGeometry(0.4, 0.4, 1, 32),
  ]

  const total = geometries.reduce((sum, geometry) => sum + getTriangleCountFromGeometry(geometry), 0)
  geometries.forEach((geometry) => geometry.dispose())

  return total
})()

const SAMPLE_MATERIAL_LIST = ['MeshStandardMaterial']

/**
 * サンプル3Dモデル（フォールバック用）
 */
const SampleModel: FC<{
  wireframe: boolean
  autoRotate: boolean
  onPolygonCountChange?: (count: number) => void
  onMaterialListChange?: (materials: string[]) => void
}> = ({
  wireframe,
  autoRotate,
  onPolygonCountChange,
  onMaterialListChange,
}) => {
    const groupRef = useRef<Group>(null)
    const torusRef = useRef<Mesh>(null)

    useEffect(() => {
      onPolygonCountChange?.(SAMPLE_TRIANGLE_COUNT)
      onMaterialListChange?.(SAMPLE_MATERIAL_LIST)
    }, [onPolygonCountChange, onMaterialListChange])

    // アニメーション
    useFrame((_, delta) => {
      if (autoRotate && groupRef.current) {
        groupRef.current.rotation.y += delta * 0.5
      }
      if (torusRef.current) {
        torusRef.current.rotation.x += delta * 0.3
        torusRef.current.rotation.z += delta * 0.2
      }
    })

    return (
      <group ref={groupRef}>
        {/* ボックス */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#6366f1" wireframe={wireframe} metalness={0.3} roughness={0.4} />
        </mesh>

        {/* 球体 */}
        <mesh position={[2, 0.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#ec4899" wireframe={wireframe} metalness={0.5} roughness={0.2} />
        </mesh>

        {/* トーラス */}
        <mesh ref={torusRef} position={[-2, 0.7, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.4, 0.15, 16, 100]} />
          <meshStandardMaterial color="#10b981" wireframe={wireframe} metalness={0.4} roughness={0.3} />
        </mesh>

        {/* コーン */}
        <mesh position={[0, 0.5, 2]} castShadow receiveShadow>
          <coneGeometry args={[0.5, 1, 32]} />
          <meshStandardMaterial color="#f59e0b" wireframe={wireframe} metalness={0.3} roughness={0.5} />
        </mesh>

        {/* シリンダー */}
        <mesh position={[0, 0.5, -2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 1, 32]} />
          <meshStandardMaterial color="#8b5cf6" wireframe={wireframe} metalness={0.4} roughness={0.3} />
        </mesh>
      </group>
    )
  }

/**
 * 外部モデル表示コンポーネント
 */
const ExternalModel: FC<{
  model: Group
  autoRotate: boolean
  wireframe: boolean
  onPolygonCountChange?: (count: number) => void
  onMaterialListChange?: (materials: string[]) => void
}> = ({
  model,
  autoRotate,
  wireframe,
  onPolygonCountChange,
  onMaterialListChange,
}) => {
    const groupRef = useRef<Group>(null)

    useEffect(() => {
      onPolygonCountChange?.(getTriangleCountFromObject(model))
      onMaterialListChange?.(getMaterialListFromObject(model))
    }, [model, onPolygonCountChange, onMaterialListChange])

    // ワイヤーフレーム設定の反映
    // モデル内の全メッシュを走査し、マテリアルのwireframeプロパティを更新する
    useEffect(() => {
      if (!model) return

      model.traverse((child) => {
        // 型ガード関数を使用して安全にMeshかどうかを判定
        if (isMesh(child)) {
          // マテリアルが配列の場合と単一の場合の両方に対応
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if ('wireframe' in mat) {
                ; (mat as MeshStandardMaterial).wireframe = wireframe
              }
            })
          } else {
            if ('wireframe' in child.material) {
              ; (child.material as MeshStandardMaterial).wireframe = wireframe
            }
          }
        }
      })
    }, [model, wireframe])

    // 自動回転
    useFrame((_, delta) => {
      if (autoRotate && groupRef.current) {
        groupRef.current.rotation.y += delta * 0.5
      }
    })

    return (
      <group ref={groupRef}>
        <primitive object={model} />
      </group>
    )
  }

/**
 * 3Dモデルコンポーネント（ビュー専念）
 */
export const Model: FC<ModelProps> = ({
  settings,
  externalModel,
  onPolygonCountChange,
  onMaterialListChange,
}) => {
  const { wireframe, autoRotate } = settings

  // 外部モデルがあれば表示、なければサンプルモデル
  if (externalModel) {
    return (
      <ExternalModel
        model={externalModel}
        autoRotate={autoRotate}
        wireframe={wireframe}
        onPolygonCountChange={onPolygonCountChange}
        onMaterialListChange={onMaterialListChange}
      />
    )
  }

  return (
    <SampleModel
      wireframe={wireframe}
      autoRotate={autoRotate}
      onPolygonCountChange={onPolygonCountChange}
      onMaterialListChange={onMaterialListChange}
    />
  )
}
