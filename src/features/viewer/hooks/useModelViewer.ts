/**
 * モデルビューアー状態管理フック
 * @description ビューアーの設定とモデル管理を行うカスタムフック
 */

import { useState, useCallback } from 'react'
import type { ViewerSettings } from '../types'
import { DEFAULT_VIEWER_SETTINGS, HDRI_LIST } from '../constants'

/**
 * 汎用設定更新関数の型
 */
type UpdateSettingFn = <K extends keyof ViewerSettings>(
  key: K,
  value: ViewerSettings[K]
) => void

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
  /** HDRI強度変更 */
  setHdriIntensity: (value: number) => void
  /** HDRI有効切替 */
  toggleHdri: () => void
  /** ディレクショナルライト有効切替 */
  toggleDirectionalLight: () => void
  /** ディレクショナルライト色変更 */
  setDirectionalLightColor: (color: string) => void
  /** ディレクショナルライト強度変更 */
  setDirectionalLightIntensity: (value: number) => void
  /** 設定リセット */
  resetSettings: () => void
  /** 汎用設定更新 */
  updateSetting: UpdateSettingFn
}

/**
 * モデルビューアー状態管理フック
 * @returns ビューアー設定と操作関数
 */
export const useModelViewer = (): UseModelViewerReturn => {
  const [settings, setSettings] = useState<ViewerSettings>(DEFAULT_VIEWER_SETTINGS)

  // 汎用設定更新関数
  const updateSetting: UpdateSettingFn = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  // トグル関数
  const toggleWireframe = useCallback(() => {
    setSettings(prev => ({ ...prev, wireframe: !prev.wireframe }))
  }, [])

  const toggleGrid = useCallback(() => {
    setSettings(prev => ({ ...prev, showGrid: !prev.showGrid }))
  }, [])

  const toggleAxes = useCallback(() => {
    setSettings(prev => ({ ...prev, showAxes: !prev.showAxes }))
  }, [])

  const toggleAutoRotate = useCallback(() => {
    setSettings(prev => ({ ...prev, autoRotate: !prev.autoRotate }))
  }, [])

  // セッター関数
  const setBackgroundColor = useCallback((color: string) => {
    updateSetting('backgroundColor', color)
  }, [updateSetting])

  const setLightAzimuth = useCallback((value: number) => {
    updateSetting('lightAzimuth', value)
  }, [updateSetting])

  const setLightElevation = useCallback((value: number) => {
    updateSetting('lightElevation', value)
  }, [updateSetting])

  const setLightDistance = useCallback((value: number) => {
    updateSetting('lightDistance', value)
  }, [updateSetting])

  const setHdriIndex = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, HDRI_LIST.length - 1))
    updateSetting('hdriIndex', clampedIndex)
  }, [updateSetting])

  const setHdriRotation = useCallback((value: number) => {
    updateSetting('hdriRotation', value)
  }, [updateSetting])

  const setHdriIntensity = useCallback((value: number) => {
    updateSetting('hdriIntensity', value)
  }, [updateSetting])

  const toggleHdri = useCallback(() => {
    setSettings(prev => ({ ...prev, hdriEnabled: !prev.hdriEnabled }))
  }, [])

  // ディレクショナルライト関連
  const toggleDirectionalLight = useCallback(() => {
    setSettings(prev => ({ ...prev, directionalLightEnabled: !prev.directionalLightEnabled }))
  }, [])

  const setDirectionalLightColor = useCallback((color: string) => {
    updateSetting('directionalLightColor', color)
  }, [updateSetting])

  const setDirectionalLightIntensity = useCallback((value: number) => {
    updateSetting('directionalLightIntensity', value)
  }, [updateSetting])

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
    setHdriIntensity,
    toggleHdri,
    toggleDirectionalLight,
    setDirectionalLightColor,
    setDirectionalLightIntensity,
    resetSettings,
    updateSetting,
  }
}
