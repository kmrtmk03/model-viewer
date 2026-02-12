/**
 * 変形球体用シェーダー
 * @description
 * クリック時に球体全体がボコボコと変形するエフェクト用のGLSLシェーダー。
 *
 * 頂点シェーダー:
 * - 共通ノイズモジュール（noiseShader.ts）のシンプレックスノイズで変形を生成
 * - クリック時に amplitude が上がり、時間経過で減衰
 * - 低周波ノイズを2層重ねて大きく丸いうねりを表現
 *
 * フラグメントシェーダー:
 * - フレネル効果によるエッジハイライト
 * - 上方向からの柔らかなライティング
 * - 微妙な環境光反射
 */

import { SIMPLEX_NOISE_GLSL } from './noiseShader'

/**
 * 頂点シェーダー
 * ノイズベースの全体変形を行う
 */
export const vertexShader = `
uniform float uTime;          // 経過時間
uniform float uAmplitude;     // 変形の振幅（クリックで上昇、自動減衰）
uniform float uFrequency;     // ノイズの周波数

// フラグメントシェーダーへ渡すvarying
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDisplacement;

// 共通ノイズ関数を挿入
${SIMPLEX_NOISE_GLSL}

void main() {
  vec3 pos = position;
  vec3 norm = normal;

  // 低周波のノイズで大きく丸い変形を生成
  // 時間変化をゆっくりにして滑らかなアニメーションに
  float noise1 = snoise(pos * uFrequency + uTime * 0.8) * 0.7;
  float noise2 = snoise(pos * uFrequency * 1.5 - uTime * 0.5) * 0.3;

  // ノイズの合成（高周波成分を排除して丸みを保つ）
  float totalNoise = noise1 + noise2;

  // 振幅を掛けて最終変位量を計算
  float displacement = totalNoise * uAmplitude;

  // 法線方向に頂点をオフセット
  pos += norm * displacement;

  // varying変数の設定
  vNormal = normalMatrix * norm;
  vDisplacement = displacement;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vViewPosition = -mvPosition.xyz;

  gl_Position = projectionMatrix * mvPosition;
}
`

/**
 * フラグメントシェーダー
 * フレネル効果付きのマット質感
 */
export const fragmentShader = `
uniform vec3 uBaseColor;      // ベースカラー
uniform vec3 uFresnelColor;   // フレネルハイライト色
uniform float uFresnelPower;  // フレネル効果の強さ

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDisplacement;

void main() {
  // 法線とビュー方向を正規化
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // フレネル効果（エッジに沿ったハイライト）
  float fresnel = pow(1.0 - abs(dot(normal, viewDir)), uFresnelPower);

  // ベースカラー + フレネルハイライト
  vec3 color = uBaseColor;
  color += uFresnelColor * fresnel * 0.6;

  // 上部からの柔らかなライティング
  float topLight = dot(normal, vec3(0.0, 1.0, 0.3)) * 0.5 + 0.5;
  color *= 0.4 + topLight * 0.6;

  // 微妙な環境光の反射
  float envReflection = pow(max(dot(reflect(-viewDir, normal), vec3(0.0, 1.0, 0.0)), 0.0), 8.0);
  color += vec3(0.05, 0.04, 0.06) * envReflection;

  gl_FragColor = vec4(color, 1.0);
}
`
