/**
 * ポストエフェクトコンポーネント
 * @description シーンにポストプロセッシングエフェクトを適用
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

interface PostEffectsProps {
  /** ポストエフェクト設定 */
  settings: PostEffectSettings
}

/**
 * ポストエフェクトコンポーネント
 * EffectComposerで各エフェクトを組み合わせる
 */
export const PostEffects: FC<PostEffectsProps> = ({ settings }) => {
  const {
    // Bloom
    bloomEnabled,
    bloomIntensity,
    bloomThreshold,
    // Vignette
    vignetteEnabled,
    vignetteOffset,
    vignetteDarkness,
    // ToneMapping
    toneMappingEnabled,
    // SMAA
    smaaEnabled,
    // HueSaturation
    hueSaturationEnabled,
    hue,
    saturation,
    // DepthOfField
    depthOfFieldEnabled,
    focusDistance,
    focalLength,
    bokehScale,
    // ColorAverage
    colorAverageEnabled,
    // Pixelation
    pixelationEnabled,
    pixelationGranularity,
    // DotScreen
    dotScreenEnabled,
    dotScreenScale,
  } = settings

  // 有効なエフェクトのみを動的に構築
  const effects = useMemo(() => {
    const effectList: ReactElement[] = []

    // SMAA アンチエイリアシング
    if (smaaEnabled) {
      effectList.push(<SMAA key="smaa" />)
    }

    // Bloom 発光効果
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

    // Vignette 周辺減光
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

    // ToneMapping 色調マッピング
    if (toneMappingEnabled) {
      effectList.push(
        <ToneMapping key="toneMapping" mode={ToneMappingMode.ACES_FILMIC} />
      )
    }

    // HueSaturation 色相・彩度調整
    if (hueSaturationEnabled) {
      effectList.push(
        <HueSaturation
          key="hueSaturation"
          hue={hue * Math.PI}
          saturation={saturation}
        />
      )
    }

    // DepthOfField 被写界深度
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

    // ColorAverage モノクロ化
    if (colorAverageEnabled) {
      effectList.push(<ColorAverage key="colorAverage" />)
    }

    // Pixelation ピクセル化
    if (pixelationEnabled) {
      effectList.push(
        <Pixelation key="pixelation" granularity={pixelationGranularity} />
      )
    }

    // DotScreen 網点効果
    if (dotScreenEnabled) {
      effectList.push(<DotScreen key="dotScreen" scale={dotScreenScale} />)
    }

    return effectList
  }, [
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

  // エフェクトが1つもなければ何もレンダリングしない
  if (effects.length === 0) {
    return null
  }

  return <EffectComposer>{effects}</EffectComposer>
}

