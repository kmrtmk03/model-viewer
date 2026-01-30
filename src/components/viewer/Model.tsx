/**
 * 3Dモデルコンポーネント
 * @description サンプル3Dオブジェクト（プリミティブ形状）を表示
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, Group } from 'three'
import type { ViewerSettings } from '@/types/model'

interface ModelProps {
  /** ビューアー設定 */
  settings: ViewerSettings
}

/**
 * サンプル3Dモデルコンポーネント
 * 実際のGLTFモデルがない場合のプリミティブ形状表示
 */
export const Model = ({ settings }: ModelProps) => {
  const { wireframe, autoRotate } = settings
  const groupRef = useRef<Group>(null)
  const torusRef = useRef<Mesh>(null)

  // 自動回転アニメーション
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5
    }
    // トーラスは常に少し回転
    if (torusRef.current) {
      torusRef.current.rotation.x += delta * 0.3
      torusRef.current.rotation.z += delta * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      {/* 中央のボックス */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#6366f1"
          wireframe={wireframe}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* 右側の球体 */}
      <mesh position={[2, 0.5, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#ec4899"
          wireframe={wireframe}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>

      {/* 左側のトーラス */}
      <mesh ref={torusRef} position={[-2, 0.7, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.4, 0.15, 16, 100]} />
        <meshStandardMaterial
          color="#10b981"
          wireframe={wireframe}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* 手前のコーン */}
      <mesh position={[0, 0.5, 2]} castShadow receiveShadow>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial
          color="#f59e0b"
          wireframe={wireframe}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* 奥のシリンダー */}
      <mesh position={[0, 0.5, -2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 1, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          wireframe={wireframe}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}
