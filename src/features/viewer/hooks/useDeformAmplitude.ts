/**
 * 変形の振幅管理を行う共通カスタムフック
 * @description
 * クリック時に振幅を最大値まで上げ、時間経過で指数関数的に減衰させる。
 * 球体用 (`useSphereDeform`) と外部モデル用 (`useModelDeform`) で
 * 共通して使用される振幅＋時間管理のロジックを一元化。
 *
 * パフォーマンス考慮:
 * - `useRef` で状態管理し、React の再レンダリングを回避
 * - `useFrame` で毎フレーム更新（R3F のレンダリングループに統合）
 */

import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'

// ============================
// 型定義
// ============================

/** フックの設定オプション */
interface DeformAmplitudeOptions {
  /** クリック時の最大振幅（デフォルト: 0.8） */
  maxAmplitude?: number
  /** 減衰速度。大きいほど速く元に戻る（デフォルト: 1.2） */
  decaySpeed?: number
}

/** フックの戻り値 */
interface UseDeformAmplitudeReturn {
  /** 現在の振幅値への参照 */
  amplitudeRef: React.RefObject<number>
  /** 現在の経過時間への参照 */
  timeRef: React.RefObject<number>
  /** クリック時に変形をトリガーする関数 */
  triggerDeform: () => void
}

// ============================
// デフォルト値
// ============================

/** デフォルトの最大振幅 */
const DEFAULT_MAX_AMPLITUDE = 0.8

/** デフォルトの減衰速度 */
const DEFAULT_DECAY_SPEED = 1.2

/** 振幅がこの値以下になったら0にリセット（計算の無駄を省く） */
const AMPLITUDE_THRESHOLD = 0.001

/**
 * 変形の振幅管理フック
 * @param options - 振幅と減衰の設定
 * @returns 振幅・時間のRef、triggerDeform関数
 */
export const useDeformAmplitude = (
  options: DeformAmplitudeOptions = {}
): UseDeformAmplitudeReturn => {
  const {
    maxAmplitude = DEFAULT_MAX_AMPLITUDE,
    decaySpeed = DEFAULT_DECAY_SPEED,
  } = options

  // 振幅と時間をRefで管理（再レンダリング回避）
  const amplitudeRef = useRef(0)
  const timeRef = useRef(0)

  /**
   * クリック時に振幅を最大値に設定する
   * 連続クリックで振幅がリセットされるため、即座に最大変形が再開される
   */
  const triggerDeform = useCallback(() => {
    amplitudeRef.current = maxAmplitude
  }, [maxAmplitude])

  /**
   * フレームごとの更新処理
   * - 経過時間を加算
   * - 振幅を指数関数的に減衰（exp(-delta * decaySpeed)）
   */
  useFrame((_, delta) => {
    timeRef.current += delta

    // 閾値以上なら指数減衰、以下なら0にリセット
    if (amplitudeRef.current > AMPLITUDE_THRESHOLD) {
      amplitudeRef.current *= Math.exp(-delta * decaySpeed)
    } else {
      amplitudeRef.current = 0
    }
  })

  return {
    amplitudeRef,
    timeRef,
    triggerDeform,
  }
}
