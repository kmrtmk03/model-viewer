/**
 * 外部モデル用ボコボコ変形エフェクトフック
 * @description
 * 読み込んだGLB/FBXモデルのマテリアルに `onBeforeCompile` で
 * 頂点シェーダーの変形処理を注入する。
 * テクスチャや色情報は元のマテリアルのものをそのまま維持する。
 *
 * 仕組み:
 * 1. モデル内の全メッシュを走査
 * 2. 各マテリアルの onBeforeCompile でノイズ関数と変形処理を頂点シェーダーに注入
 * 3. 共通フック `useDeformAmplitude` で振幅・時間を管理
 * 4. useFrame で全マテリアルの uniform を毎フレーム更新
 *
 * 設計方針:
 * - 振幅管理ロジックは `useDeformAmplitude` に委譲（球体用と共通）
 * - ノイズGLSLコードは `noiseShader.ts` から取得（共通モジュール）
 * - `_d` サフィックス付き関数名で既存シェーダーとの名前衝突を回避
 */

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Material, Mesh, Object3D } from 'three'
import { isMesh } from '../utils/modelAnalyzer'
import { SIMPLEX_NOISE_GLSL_INJECTED } from '../shaders/noiseShader'
import { useDeformAmplitude } from './useDeformAmplitude'

// ============================
// 定数
// ============================

/** クリック時の最大振幅（外部モデル用、球体より控えめに設定） */
const MAX_AMPLITUDE = 0.07

/** 振幅の減衰速度（大きいほど速く元に戻る） */
const DECAY_SPEED = 3.0

/** ノイズの周波数 */
const NOISE_FREQUENCY = 2.4

// ============================
// シェーダー注入コード
// ============================

/**
 * onBeforeCompile で注入する uniform 宣言
 * ノイズ関数と合わせて頂点シェーダーの先頭に追加される
 */
const DEFORM_UNIFORMS_GLSL = `
// --- ボコボコ変形エフェクト用 uniform ---
uniform float uDeformTime;
uniform float uDeformAmplitude;
uniform float uDeformFrequency;
`

/**
 * 頂点変形コード
 * Three.js の `#include <begin_vertex>` を置き換えて変形を適用
 * `snoise_d` は注入されたノイズ関数（_d サフィックス付き）
 */
const DEFORM_VERTEX_GLSL = `
vec3 transformed = vec3(position);

// ノイズベースの変形を適用
// 2層のノイズを異なる周波数・方向で重ねて自然なうねりを生成
float dn1 = snoise_d(transformed * uDeformFrequency + uDeformTime * 0.8) * 0.7;
float dn2 = snoise_d(transformed * uDeformFrequency * 1.5 - uDeformTime * 0.5) * 0.3;
float deformDisp = (dn1 + dn2) * uDeformAmplitude;
transformed += normal * deformDisp;
`

// ============================
// 型定義
// ============================

/** uniform オブジェクトの型定義 */
interface DeformUniforms {
  uDeformTime: { value: number }
  uDeformAmplitude: { value: number }
  uDeformFrequency: { value: number }
}

/** フックの戻り値 */
interface UseModelDeformReturn {
  /** クリック時に変形をトリガー */
  triggerDeform: () => void
}

/**
 * 外部モデル用変形エフェクトフック
 * @param model - 対象の3Dモデル（Group）
 * @returns triggerDeform 関数
 */
export const useModelDeform = (model: Group | null): UseModelDeformReturn => {
  // 共通の振幅管理フック（外部モデル用のパラメータを設定）
  const { amplitudeRef, timeRef, triggerDeform } = useDeformAmplitude({
    maxAmplitude: MAX_AMPLITUDE,
    decaySpeed: DECAY_SPEED,
  })

  // 注入したuniformの参照を保持（毎フレーム更新用）
  const uniformsListRef = useRef<DeformUniforms[]>([])

  /**
   * モデルの全マテリアルにシェーダー注入を実行
   * モデルが変わった時に再注入される
   */
  useEffect(() => {
    if (!model) return

    const uniformsList: DeformUniforms[] = []

    model.traverse((child: Object3D) => {
      if (!isMesh(child)) return

      const mesh = child as Mesh
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

      materials.forEach((mat: Material) => {
        // マテリアルごとにuniformインスタンスを生成
        const deformUniforms: DeformUniforms = {
          uDeformTime: { value: 0 },
          uDeformAmplitude: { value: 0 },
          uDeformFrequency: { value: NOISE_FREQUENCY },
        }

        uniformsList.push(deformUniforms)

        // onBeforeCompile で頂点シェーダーにノイズ変形を注入
        mat.onBeforeCompile = (shader) => {
          // uniform を登録
          shader.uniforms.uDeformTime = deformUniforms.uDeformTime
          shader.uniforms.uDeformAmplitude = deformUniforms.uDeformAmplitude
          shader.uniforms.uDeformFrequency = deformUniforms.uDeformFrequency

          // 頂点シェーダーの先頭にuniform宣言とノイズ関数を挿入
          shader.vertexShader =
            DEFORM_UNIFORMS_GLSL + '\n' +
            SIMPLEX_NOISE_GLSL_INJECTED + '\n' +
            shader.vertexShader

          // #include <begin_vertex> を変形付きコードで置換
          shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            DEFORM_VERTEX_GLSL
          )
        }

        // シェーダーの再コンパイルを強制
        mat.needsUpdate = true
      })
    })

    uniformsListRef.current = uniformsList
  }, [model])

  /** フレームごとに全マテリアルのuniformを更新 */
  useFrame(() => {
    for (const uniforms of uniformsListRef.current) {
      uniforms.uDeformTime.value = timeRef.current
      uniforms.uDeformAmplitude.value = amplitudeRef.current
    }
  })

  return { triggerDeform }
}
