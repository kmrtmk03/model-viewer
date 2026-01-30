/**
 * モデルビューアー状態管理フック
 * @description ビューアーの設定とモデル管理を行うカスタムフック
 */

import { useState, useCallback } from 'react'
import type { ViewerSettings } from '@/types/model'
import { DEFAULT_VIEWER_SETTINGS, HDRI_LIST } from '@/constants/viewer'

/**
 * フックの戻り値の型
 */
interface UseModelViewerReturn {
  /** ビューアー設定 */
  settings: ViewerSettings
  /** ワイヤーフレーム表示切替 */
  toggleWireframe: () => void
  /** グリッド表示切替 */
  toggleGrid: () => void
  /** 軸ヘルパー表示切替 */
  toggleAxes: () => void
  /** 自動回転切替 */
  toggleAutoRotate: () => void
  /** 背景色変更 */
  setBackgroundColor: (color: string) => void
  /** ライト方位角変更 */
  setLightAzimuth: (value: number) => void
  /** ライト仰角変更 */
  setLightElevation: (value: number) => void
  /** ライト距離変更 */
  setLightDistance: (value: number) => void
  /** HDRI変更 */
  setHdriIndex: (index: number) => void
  /** HDRI回転変更 */
  setHdriRotation: (value: number) => void
  /** 設定リセット */
  resetSettings: () => void
}

/**
 * モデルビューアー状態管理フック
 * @returns ビューアー設定と操作関数
 */
export const useModelViewer = (): UseModelViewerReturn => {
  // ビューアー設定の状態
  const [settings, setSettings] = useState<ViewerSettings>(DEFAULT_VIEWER_SETTINGS)

  // ワイヤーフレーム表示切替
  const toggleWireframe = useCallback(() => {
    setSettings(prev => ({ ...prev, wireframe: !prev.wireframe }))
  }, [])

  // グリッド表示切替
  const toggleGrid = useCallback(() => {
    setSettings(prev => ({ ...prev, showGrid: !prev.showGrid }))
  }, [])

  // 軸ヘルパー表示切替
  const toggleAxes = useCallback(() => {
    setSettings(prev => ({ ...prev, showAxes: !prev.showAxes }))
  }, [])

  // 自動回転切替
  const toggleAutoRotate = useCallback(() => {
    setSettings(prev => ({ ...prev, autoRotate: !prev.autoRotate }))
  }, [])

  // 背景色変更
  const setBackgroundColor = useCallback((color: string) => {
    setSettings(prev => ({ ...prev, backgroundColor: color }))
  }, [])

  // ライト方位角変更
  const setLightAzimuth = useCallback((value: number) => {
    setSettings(prev => ({ ...prev, lightAzimuth: value }))
  }, [])

  // ライト仰角変更
  const setLightElevation = useCallback((value: number) => {
    setSettings(prev => ({ ...prev, lightElevation: value }))
  }, [])

  // ライト距離変更
  const setLightDistance = useCallback((value: number) => {
    setSettings(prev => ({ ...prev, lightDistance: value }))
  }, [])

  // HDRI変更
  const setHdriIndex = useCallback((index: number) => {
    // 有効なインデックス範囲にクランプ
    const clampedIndex = Math.max(0, Math.min(index, HDRI_LIST.length - 1))
    setSettings(prev => ({ ...prev, hdriIndex: clampedIndex }))
  }, [])

  // HDRI回転変更
  const setHdriRotation = useCallback((value: number) => {
    setSettings(prev => ({ ...prev, hdriRotation: value }))
  }, [])

  // 設定リセット
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_VIEWER_SETTINGS)
  }, [])

  return {
    settings,
    toggleWireframe,
    toggleGrid,
    toggleAxes,
    toggleAutoRotate,
    setBackgroundColor,
    setLightAzimuth,
    setLightElevation,
    setLightDistance,
    setHdriIndex,
    setHdriRotation,
    resetSettings,
  }
}
