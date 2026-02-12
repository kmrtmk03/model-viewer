/**
 * 球体用ボコボコ変形エフェクト管理カスタムフック
 * @description
 * クリック時に球体全体がボコボコと変形するエフェクトのロジックを管理。
 * 振幅管理は共通フック `useDeformAmplitude` に委譲し、
 * このフックは ShaderMaterial の uniform 更新のみを担当する。
 *
 * 機能:
 * - ShaderMaterial への参照を保持
 * - フレームごとにシェーダー uniform (uTime, uAmplitude) を更新
 * - クリック時のトリガー関数を提供
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ShaderMaterial } from 'three'
import { useDeformAmplitude } from './useDeformAmplitude'

// ============================
// 型定義
// ============================

/** フックの戻り値 */
interface UseSphereDeformReturn {
  /** シェーダーマテリアルのRef */
  materialRef: React.RefObject<ShaderMaterial | null>
  /** クリック時に変形をトリガーする関数 */
  triggerDeform: () => void
}

/**
 * 球体用変形エフェクト管理フック
 * @returns materialRef と triggerDeform 関数
 */
export const useSphereDeform = (): UseSphereDeformReturn => {
  // シェーダーマテリアルへの参照
  const materialRef = useRef<ShaderMaterial>(null)

  // 共通の振幅管理フック
  const { amplitudeRef, timeRef, triggerDeform } = useDeformAmplitude()

  /**
   * フレームごとにシェーダーuniformを更新
   * 共通フックが振幅・時間の更新を行った後に実行される
   */
  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = timeRef.current
      materialRef.current.uniforms.uAmplitude.value = amplitudeRef.current
    }
  })

  return {
    materialRef,
    triggerDeform,
  }
}
