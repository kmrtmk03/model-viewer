/**
 * 背景エフェクトフック
 * @description シーンの背景色や環境マップの設定変更による副作用を管理
 */

import { useEffect } from 'react'
import { Color } from 'three'
import type { Scene } from 'three'

interface UseBackgroundEffectProps {
  /** Three.jsのシーンオブジェクト */
  scene: Scene
  /** 背景モード ('color' | 'hdri') */
  backgroundMode: 'color' | 'hdri'
  /** 背景色 (HEX文字列) */
  backgroundColor: string
}

/**
 * 背景更新用の副作用フック
 * @param props 背景設定に必要なプロパティ
 */
export const useBackgroundEffect = ({
  scene,
  backgroundMode,
  backgroundColor,
}: UseBackgroundEffectProps): void => {
  // 背景色設定（Colorモード時）
  // <color attach="background" /> はDreiEnvironmentとの競合で
  // 意図した挙動にならない場合があるため、直接scene.backgroundを操作する
  useEffect(() => {
    if (backgroundMode === 'color') {
      scene.background = new Color(backgroundColor)
    } else {
      // HDRIモード時はDreiEnvironmentが背景を管理するため、
      // ここでは特に何もしない（あるいはnullにしてクリアする等の処理が必要な場合はここに追加）
      // 現状の実装ではDreiEnvironmentのbackgroundプロパティが制御するため競合しないようにする
      scene.background = null
    }
  }, [backgroundMode, backgroundColor, scene])
}
