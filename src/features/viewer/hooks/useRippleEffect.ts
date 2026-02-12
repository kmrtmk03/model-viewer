/**
 * ボコボコ変形エフェクト管理カスタムフック
 * @description
 * クリック時に球体全体がボコボコと変形するエフェクトのロジックを管理。
 *
 * 機能:
 * - クリックで振幅（amplitude）を即座に最大値まで上げる
 * - 時間経過で振幅が滑らかに減衰
 * - useFrameによるリアルタイムのuniform更新
 */

import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ShaderMaterial } from 'three'

// ============================
// 定数
// ============================

/** クリック時の最大振幅 */
const MAX_AMPLITUDE = 0.8

/** 振幅の減衰速度（大きいほど速く元に戻る） */
const DECAY_SPEED = 1.2

/** フックの戻り値 */
interface UseRippleEffectReturn {
  /** シェーダーマテリアルのRef */
  materialRef: React.RefObject<ShaderMaterial | null>
  /** クリック時に変形をトリガーする関数 */
  triggerDeform: () => void
}

/**
 * ボコボコ変形エフェクト管理フック
 * @returns materialRef と triggerDeform 関数
 */
export const useRippleEffect = (): UseRippleEffectReturn => {
  // シェーダーマテリアルへの参照
  const materialRef = useRef<ShaderMaterial>(null)

  // 現在の振幅値（Refで管理してReactの再レンダリングを回避）
  const amplitudeRef = useRef(0)

  // 経過時間の管理
  const timeRef = useRef(0)

  /**
   * クリック時に変形をトリガー
   * 振幅を最大値に設定する
   */
  const triggerDeform = useCallback(() => {
    amplitudeRef.current = MAX_AMPLITUDE
  }, [])

  /**
   * フレームごとの更新処理
   * - 時間の更新
   * - 振幅の減衰
   * - シェーダーuniformへの反映
   */
  useFrame((_, delta) => {
    timeRef.current += delta

    // 振幅を滑らかに減衰
    if (amplitudeRef.current > 0.001) {
      amplitudeRef.current *= Math.exp(-delta * DECAY_SPEED)
    } else {
      amplitudeRef.current = 0
    }

    // シェーダーuniformを更新
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
