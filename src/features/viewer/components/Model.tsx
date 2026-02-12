/**
 * 3Dモデルコンポーネント
 * @description 外部モデルまたは波紋エフェクト付き球体を表示（ビュー専念）
 *
 * このコンポーネントは以下の責務を持ちます:
 * - 波紋エフェクト付き球体の表示（外部モデル未読み込み時）
 * - 外部GLB/FBXモデルの表示
 * - ワイヤーフレーム表示の切り替え
 * - 自動回転アニメーション
 * - ポリゴン数・マテリアル情報の親への通知
 */

import { useRef, useEffect, type FC } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  type Group,
  type MeshStandardMaterial,
} from 'three'
import type { ViewerSettings } from '../types'
import {
  getTriangleCountFromObject,
  getMaterialListFromObject,
  isMesh,
} from '../utils/modelAnalyzer'
import { RippleSphere } from './RippleSphere'
import { useModelDeform } from '../hooks/useModelDeform'

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

    // ボコボコ変形エフェクトフック
    const { triggerDeform } = useModelDeform(model)

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

    /**
     * モデルクリック時にボコボコ変形をトリガー
     */
    const handleClick = () => {
      triggerDeform()
    }

    return (
      <group ref={groupRef} onClick={handleClick}>
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
    <RippleSphere
      onPolygonCountChange={onPolygonCountChange}
      onMaterialListChange={onMaterialListChange}
    />
  )
}
