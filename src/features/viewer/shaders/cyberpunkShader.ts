/**
 * Cyberpunk Effect用フラグメントシェーダー
 * @description
 * 以下の視覚効果を組み合わせたGLSLシェーダー:
 * - RGBシフト (色収差)
 * - スキャンライン (CRTモニター風)
 * - ノイズ (フィルムグレイン風)
 * - ヴィネット (周辺減光)
 */
export const fragmentShader = `
uniform float time;
uniform float scanlineDensity;
uniform float scanlineStrength;
uniform float noiseStrength;
uniform float rgbShiftStrength;

// 乱数生成
float rand(vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // RGB Shift
  float r = texture2D(inputBuffer, uv + vec2(rgbShiftStrength * 0.005, 0.0)).r;
  float g = texture2D(inputBuffer, uv).g;
  float b = texture2D(inputBuffer, uv - vec2(rgbShiftStrength * 0.005, 0.0)).b;
  vec3 color = vec3(r, g, b);

  // Scanlines
  float scanline = sin(uv.y * scanlineDensity * 100.0 + time * 5.0) * 0.5 + 0.5;
  color -= scanline * scanlineStrength;

  // Noise
  float noise = rand(uv + time) * noiseStrength;
  color += noise;

  // Vignette-like darkening at edges for CRT feel
  float dist = distance(uv, vec2(0.5));
  color *= 1.0 - dist * 0.5;

  outputColor = vec4(color, inputColor.a);
}
`
