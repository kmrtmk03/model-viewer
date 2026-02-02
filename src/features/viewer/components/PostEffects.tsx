/**
 * ポストエフェクトコンポーネント
 * @description シーンにポストプロセッシングエフェクトを適用
 * 
 * @react-three/postprocessing の EffectComposer を使用して
 * 複数のエフェクトを組み合わせてレンダリング後処理を行う。
 * 
 * 対応エフェクト:
 * - SMAA: アンチエイリアシング（ジャギー軽減）
 * - Bloom: 発光効果（明るい部分のグロー）
 * - Vignette: 周辺減光（画面端を暗くする）
 * - ToneMapping: HDR→LDR色調マッピング（ACES Filmic）
 * - HueSaturation: 色相・彩度調整
 * - DepthOfField: 被写界深度（ボケ効果）
 * - ColorAverage: モノクロ化
 * - Pixelation: ピクセル化（レトロ風）
 * - DotScreen: 網点効果（ハーフトーン）
 * 
 * @example
 * ```tsx
 * <Canvas>
 *   <Scene />
 *   <PostEffects settings={postEffectSettings} />
 * </Canvas>
 * ```
 */

import { useMemo } from 'react'
import type { FC, ReactElement } from 'react'
import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
  SMAA,
  HueSaturation,
  DepthOfField,
  ColorAverage,
  Pixelation,
  DotScreen,
} from '@react-three/postprocessing'
import { ToneMappingMode, BlendFunction } from 'postprocessing'
import type { PostEffectSettings } from '../types'

/**
 * PostEffectsコンポーネントのProps
 */
interface PostEffectsProps {
  /** 
   * ポストエフェクト設定
   * 各エフェクトの有効/無効とパラメータを含む
   */
  settings: PostEffectSettings
}

/**
 * ポストエフェクトコンポーネント
 * 
 * EffectComposer内で各エフェクトを条件に応じて動的に構築し、
 * 有効なエフェクトのみをレンダリングする。
 * 
 * エフェクトが1つも有効でない場合はnullを返し、
 * 不要なEffectComposerのマウントを回避する。
 * 
 * @param props - コンポーネントProps
 * @returns EffectComposerでラップされたエフェクト群、または null
 */
export const PostEffects: FC<PostEffectsProps> = ({ settings }) => {
  // 設定から必要な値を分割代入
  // （可読性のためにグループ化してコメント付き）
  const {
    // ==========================================
    // Bloom（発光効果）
    // ==========================================
    bloomEnabled,
    bloomIntensity,
    bloomThreshold,

    // ==========================================
    // Vignette（周辺減光）
    // ==========================================
    vignetteEnabled,
    vignetteOffset,
    vignetteDarkness,

    // ==========================================
    // ToneMapping（色調マッピング）
    // ==========================================
    toneMappingEnabled,

    // ==========================================
    // SMAA（アンチエイリアシング）
    // ==========================================
    smaaEnabled,

    // ==========================================
    // HueSaturation（色相・彩度）
    // ==========================================
    hueSaturationEnabled,
    hue,
    saturation,

    // ==========================================
    // DepthOfField（被写界深度）
    // ==========================================
    depthOfFieldEnabled,
    focusDistance,
    focalLength,
    bokehScale,

    // ==========================================
    // ColorAverage（モノクロ化）
    // ==========================================
    colorAverageEnabled,

    // ==========================================
    // Pixelation（ピクセル化）
    // ==========================================
    pixelationEnabled,
    pixelationGranularity,

    // ==========================================
    // DotScreen（網点効果）
    // ==========================================
    dotScreenEnabled,
    dotScreenScale,
  } = settings

  /**
   * 有効なエフェクトのみを動的に構築
   * 
   * メモ化により、settingsが変更された時のみ再構築する。
   * 依存配列は settings オブジェクト全体を使用し、
   * 個別プロパティの列挙を避けることで保守性を向上。
   */
  const effects = useMemo(() => {
    const effectList: ReactElement[] = []

    // ------------------------------------------
    // SMAA アンチエイリアシング
    // エッジのジャギーを滑らかにする
    // ------------------------------------------
    if (smaaEnabled) {
      effectList.push(<SMAA key="smaa" />)
    }

    // ------------------------------------------
    // Bloom 発光効果
    // 明るい部分を拡散させてグロー効果を生成
    // luminanceSmoothing: 輝度の滑らかさ（固定値0.9）
    // ------------------------------------------
    if (bloomEnabled) {
      effectList.push(
        <Bloom
          key="bloom"
          intensity={bloomIntensity}
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={0.9}
        />
      )
    }

    // ------------------------------------------
    // Vignette 周辺減光
    // 画面の端を暗くして中央に注目させる効果
    // BlendFunction.NORMAL で通常のブレンディング
    // ------------------------------------------
    if (vignetteEnabled) {
      effectList.push(
        <Vignette
          key="vignette"
          offset={vignetteOffset}
          darkness={vignetteDarkness}
          blendFunction={BlendFunction.NORMAL}
        />
      )
    }

    // ------------------------------------------
    // ToneMapping 色調マッピング
    // ACES Filmic: 映画的な色彩表現
    // ------------------------------------------
    if (toneMappingEnabled) {
      effectList.push(
        <ToneMapping key="toneMapping" mode={ToneMappingMode.ACES_FILMIC} />
      )
    }

    // ------------------------------------------
    // HueSaturation 色相・彩度調整
    // hue: -PI〜PI の範囲で色相を回転
    // saturation: -1（グレースケール）〜1（鮮やか）
    // ------------------------------------------
    if (hueSaturationEnabled) {
      effectList.push(
        <HueSaturation
          key="hueSaturation"
          hue={hue * Math.PI}
          saturation={saturation}
        />
      )
    }

    // ------------------------------------------
    // DepthOfField 被写界深度
    // カメラのピント・ボケを再現
    // ------------------------------------------
    if (depthOfFieldEnabled) {
      effectList.push(
        <DepthOfField
          key="depthOfField"
          focusDistance={focusDistance}
          focalLength={focalLength}
          bokehScale={bokehScale}
        />
      )
    }

    // ------------------------------------------
    // ColorAverage モノクロ化
    // シーン全体をグレースケールに変換
    // ------------------------------------------
    if (colorAverageEnabled) {
      effectList.push(<ColorAverage key="colorAverage" />)
    }

    // ------------------------------------------
    // Pixelation ピクセル化
    // レトロゲーム風のピクセルアート効果
    // ------------------------------------------
    if (pixelationEnabled) {
      effectList.push(
        <Pixelation key="pixelation" granularity={pixelationGranularity} />
      )
    }

    // ------------------------------------------
    // DotScreen 網点効果
    // 印刷物のようなハーフトーン効果
    // ------------------------------------------
    if (dotScreenEnabled) {
      effectList.push(<DotScreen key="dotScreen" scale={dotScreenScale} />)
    }

    return effectList
  }, [
    // 依存配列: settingsの各プロパティを個別に指定
    // （settingsオブジェクト全体だとリファレンスが毎回変わる可能性があるため）
    smaaEnabled,
    bloomEnabled,
    bloomIntensity,
    bloomThreshold,
    vignetteEnabled,
    vignetteOffset,
    vignetteDarkness,
    toneMappingEnabled,
    hueSaturationEnabled,
    hue,
    saturation,
    depthOfFieldEnabled,
    focusDistance,
    focalLength,
    bokehScale,
    colorAverageEnabled,
    pixelationEnabled,
    pixelationGranularity,
    dotScreenEnabled,
    dotScreenScale,
  ])

  // ------------------------------------------
  // エフェクトが1つもなければ何もレンダリングしない
  // （EffectComposerのマウントを回避してパフォーマンス向上）
  // ------------------------------------------
  if (effects.length === 0) {
    return null
  }

  return <EffectComposer>{effects}</EffectComposer>
}


