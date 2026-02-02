import { Effect } from 'postprocessing'
import { Uniform, type WebGLRenderer, type WebGLRenderTarget } from 'three'
import { forwardRef, useMemo } from 'react'
import { fragmentShader } from '../shaders/cyberpunkShader'

/**
 * CyberpunkEffectのプロパティ定義
 */
interface CyberpunkEffectProps {
  /** スキャンラインの密度 @default 1.0 */
  scanlineDensity?: number
  /** スキャンラインの強度 @default 0.3 */
  scanlineStrength?: number
  /** ノイズの強度 @default 0.1 */
  noiseStrength?: number
  /** RGBシフト（色収差）の強度 @default 0.5 */
  rgbShiftStrength?: number
}

/**
 * CyberpunkEffectの実装クラス
 * @description postprocessingのEffectクラスを継承したカスタムエフェクト
 */
class CyberpunkEffectImpl extends Effect {
  /**
   * コンストラクタ
   * @param options エフェクトの設定オプション
   */
  constructor({
    scanlineDensity = 1.0,
    scanlineStrength = 0.3,
    noiseStrength = 0.1,
    rgbShiftStrength = 0.5,
  }: CyberpunkEffectProps = {}) {
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

  /**
   * フレームごとの更新処理
   * @description 時間経過に伴うアニメーション（timeユニフォームの更新）を行う
   * @param _renderer WebGLレンダラー (未使用)
   * @param _inputBuffer 入力バッファ (未使用)
   * @param deltaTime 前回のフレームからの経過時間
   */
  update(_renderer: WebGLRenderer, _inputBuffer: WebGLRenderTarget, deltaTime: number): void {
    const time = this.uniforms.get('time')
    if (time) {
      time.value += deltaTime
    }
  }
}

/**
 * CyberpunkEffectコンポーネント
 * @description React Three Fiberで使用するCyberpunkエフェクトのラッパーコンポーネント
 * 
 * 以下の視覚効果を提供:
 * - スキャンライン (Scanlines)
 * - ノイズ (Noise)
 * - 色収差 (RGB Shift)
 */
export const CyberpunkEffect = forwardRef<CyberpunkEffectImpl, CyberpunkEffectProps>(
  ({ scanlineDensity = 1.0, scanlineStrength = 0.3, noiseStrength = 0.1, rgbShiftStrength = 0.5 }, ref) => {
    const effect = useMemo(
      () => new CyberpunkEffectImpl({ scanlineDensity, scanlineStrength, noiseStrength, rgbShiftStrength }),
      [scanlineDensity, scanlineStrength, noiseStrength, rgbShiftStrength]
    )

    return <primitive object={effect} ref={ref} dispose={null} />
  }
)
