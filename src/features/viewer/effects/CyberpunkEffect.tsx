import { Effect } from 'postprocessing'
import { Uniform } from 'three'
import { forwardRef, useMemo } from 'react'

// フラグメントシェーダー: Cyberpunk Effect
// - スキャンライン
// - ノイズ
// - 色収差（RGB Shift）
const fragmentShader = `
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

interface CyberpunkEffectImpl extends Effect {
  constructor: new (options?: any) => any
}

// Effectクラスの実装
class CyberpunkEffectImpl extends Effect {
  constructor({
    scanlineDensity = 1.0,
    scanlineStrength = 0.3,
    noiseStrength = 0.1,
    rgbShiftStrength = 0.5,
  } = {}) {
    super('CyberpunkEffect', fragmentShader, {
      uniforms: new Map([
        ['time', new Uniform(0.0)],
        ['scanlineDensity', new Uniform(scanlineDensity)],
        ['scanlineStrength', new Uniform(scanlineStrength)],
        ['noiseStrength', new Uniform(noiseStrength)],
        ['rgbShiftStrength', new Uniform(rgbShiftStrength)],
      ]),
    })
  }

  update(_renderer: any, _inputBuffer: any, deltaTime: number) {
    const time = this.uniforms.get('time')
    if (time) {
      time.value += deltaTime
    }
  }
}

// Reactコンポーネント用Props
interface CyberpunkEffectProps {
  scanlineDensity?: number
  scanlineStrength?: number
  noiseStrength?: number
  rgbShiftStrength?: number
}

// Reactコンポーネントとしてのラッパー
export const CyberpunkEffect = forwardRef<CyberpunkEffectImpl, CyberpunkEffectProps>(
  ({ scanlineDensity = 1.0, scanlineStrength = 0.3, noiseStrength = 0.1, rgbShiftStrength = 0.5 }, ref) => {
    const effect = useMemo(
      () => new CyberpunkEffectImpl({ scanlineDensity, scanlineStrength, noiseStrength, rgbShiftStrength }),
      [scanlineDensity, scanlineStrength, noiseStrength, rgbShiftStrength]
    )

    return <primitive object={effect} ref={ref} dispose={null} />
  }
)
