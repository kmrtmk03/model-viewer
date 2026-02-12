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
 * 3. useFrame で時間・振幅のuniformを毎フレーム更新
 * 4. クリック時に振幅を上げ、自動減衰させる
 */

import { useRef, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Material, Mesh, Object3D } from 'three'
import { isMesh } from '../utils/modelAnalyzer'

// ============================
// 定数
// ============================

/** クリック時の最大振幅 */
const MAX_AMPLITUDE = 0.07

/** 振幅の減衰速度 */
const DECAY_SPEED = 3.0

/** ノイズの周波数 */
const NOISE_FREQUENCY = 2.4

// ============================
// シェーダー注入コード
// ============================

/**
 * 3Dシンプレックスノイズ関数（GLSLコード）
 * 頂点シェーダーに注入するノイズ生成関数
 */
const NOISE_GLSL = `
// --- ボコボコ変形エフェクト用 uniform ---
uniform float uDeformTime;
uniform float uDeformAmplitude;
uniform float uDeformFrequency;

// --- シンプレックスノイズ関数 ---
vec3 mod289_d(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289_d(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute_d(vec4 x) { return mod289_d(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt_d(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise_d(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289_d(i);
  vec4 p = permute_d(permute_d(permute_d(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt_d(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`

/**
 * 頂点変形コード（頂点シェーダーの #include <begin_vertex> を置き換え）
 */
const DEFORM_VERTEX_GLSL = `
vec3 transformed = vec3(position);

// ノイズベースの変形を適用
float dn1 = snoise_d(transformed * uDeformFrequency + uDeformTime * 0.8) * 0.7;
float dn2 = snoise_d(transformed * uDeformFrequency * 1.5 - uDeformTime * 0.5) * 0.3;
float deformDisp = (dn1 + dn2) * uDeformAmplitude;
transformed += normal * deformDisp;
`

// ============================
// 型定義
// ============================

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
  // 振幅と時間の管理
  const amplitudeRef = useRef(0)
  const timeRef = useRef(0)

  // 注入したuniformの参照を保持（毎フレーム更新用）
  const uniformsListRef = useRef<Array<{
    uDeformTime: { value: number }
    uDeformAmplitude: { value: number }
    uDeformFrequency: { value: number }
  }>>([])

  /**
   * モデルの全マテリアルにシェーダー注入を実行
   */
  useEffect(() => {
    if (!model) return

    const uniformsList: typeof uniformsListRef.current = []

    model.traverse((child: Object3D) => {
      if (!isMesh(child)) return

      const mesh = child as Mesh
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

      materials.forEach((mat: Material) => {
        // カスタム uniform を定義
        const deformUniforms = {
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

          // 頂点シェーダーにノイズ関数を挿入（void main() の前に追加）
          shader.vertexShader = NOISE_GLSL + '\n' + shader.vertexShader

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

  /** クリック時に変形をトリガー */
  const triggerDeform = useCallback(() => {
    amplitudeRef.current = MAX_AMPLITUDE
  }, [])

  /** フレームごとの更新 */
  useFrame((_, delta) => {
    timeRef.current += delta

    // 振幅を滑らかに減衰
    if (amplitudeRef.current > 0.001) {
      amplitudeRef.current *= Math.exp(-delta * DECAY_SPEED)
    } else {
      amplitudeRef.current = 0
    }

    // 全マテリアルのuniformを更新
    for (const uniforms of uniformsListRef.current) {
      uniforms.uDeformTime.value = timeRef.current
      uniforms.uDeformAmplitude.value = amplitudeRef.current
    }
  })

  return { triggerDeform }
}
