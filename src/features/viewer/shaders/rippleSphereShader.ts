/**
 * RippleSphere用シェーダー
 * @description
 * クリック時に球体全体がボコボコと変形するエフェクト用のGLSLシェーダー。
 *
 * 頂点シェーダー:
 * - 3Dノイズ関数で有機的なボコボコ変形を生成
 * - クリック時にamplitudeが上がり、時間経過で減衰
 * - 複数の周波数を重ねてリッチな変形パターンを作る
 *
 * フラグメントシェーダー:
 * - ダークなマット質感（funtech.inc風）
 * - フレネル効果によるエッジハイライト
 * - 変形箇所のハイライト表示
 */

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

//
// 3Dシンプレックスノイズ (Simplex Noise)
// Stefan Gustavson による実装をベースに簡略化
//
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // 入力座標から格子点を求める
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
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

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

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
 * ダークなマット質感 + フレネル効果
 */
export const fragmentShader = `
uniform vec3 uBaseColor;      // ベースカラー
uniform vec3 uFresnelColor;   // フレネルハイライト色
uniform float uFresnelPower;  // フレネル効果の強さ
uniform float uAmplitude;     // 変形振幅（ハイライト強度に影響）

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDisplacement;

void main() {
  // 正規化
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // フレネル効果（エッジに沿ったハイライト）
  float fresnel = pow(1.0 - abs(dot(normal, viewDir)), uFresnelPower);

  // ベースカラー + フレネルハイライト
  vec3 color = uBaseColor;
  color += uFresnelColor * fresnel * 0.6;

  // 変形箇所のハイライトなし（クリーンな表面を維持）

  // 上部からの柔らかなライティング
  float topLight = dot(normal, vec3(0.0, 1.0, 0.3)) * 0.5 + 0.5;
  color *= 0.4 + topLight * 0.6;

  // 微妙な環境光の反射
  float envReflection = pow(max(dot(reflect(-viewDir, normal), vec3(0.0, 1.0, 0.0)), 0.0), 8.0);
  color += vec3(0.05, 0.04, 0.06) * envReflection;

  gl_FragColor = vec4(color, 1.0);
}
`
