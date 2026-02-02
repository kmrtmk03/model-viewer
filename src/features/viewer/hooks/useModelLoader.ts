/**
 * モデルローダーフック
 * @description FBX/GLBファイルのドラッグアンドドロップ読み込みを管理
 */

import { useState, useCallback, useEffect } from 'react'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Box3, Vector3 } from 'three'
import type { Group, Object3D } from 'three'
import type { LoadedModel } from '../types'

/**
 * フックの戻り値
 */
interface UseModelLoaderReturn {
  /** 読み込まれたモデル */
  loadedModel: LoadedModel | null
  /** 読み込まれた3Dオブジェクト */
  modelObject: Group | null
  /** 読み込み中フラグ */
  isLoading: boolean
  /** エラーメッセージ */
  error: string | null
  /** ドラッグ中フラグ */
  isDragging: boolean
  /** ドラッグ開始ハンドラー */
  handleDragEnter: (e: React.DragEvent) => void
  /** ドラッグ中ハンドラー */
  handleDragOver: (e: React.DragEvent) => void
  /** ドラッグ離脱ハンドラー */
  handleDragLeave: (e: React.DragEvent) => void
  /** ドロップハンドラー */
  handleDrop: (e: React.DragEvent) => void
  /** モデルクリア */
  clearModel: () => void
}

/**
 * 対応するファイル拡張子
 */
const SUPPORTED_EXTENSIONS = ['fbx', 'glb', 'gltf'] as const

/**
 * ファイル拡張子からモデルタイプを取得
 * @param filename ファイル名
 * @returns 'fbx' | 'gltf' | null
 */
const getModelType = (filename: string): 'fbx' | 'gltf' | null => {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'fbx') return 'fbx'
  if (ext === 'glb' || ext === 'gltf') return 'gltf'
  return null
}

/**
 * モデルを正規化（サイズ・位置調整）
 * @description モデルのバウンディングボックスを計算し、
 * 原点中心・底面合わせ・適切なスケール（最大寸法2）に調整する
 * @param object 正規化対象の3Dオブジェクト
 */
const normalizeModel = (object: Object3D): void => {
  // バウンディングボックスを計算
  const box = new Box3().setFromObject(object)
  const size = new Vector3()
  const center = new Vector3()
  box.getSize(size)
  box.getCenter(center)

  // 最大サイズを取得
  const maxDim = Math.max(size.x, size.y, size.z)

  // サイズが極端に小さい（または0）の場合は正規化しない（ゼロ除算防止）
  if (maxDim < 0.0001) {
    console.warn('Model size is too small or zero, skipping normalization')
    return
  }

  // 最大サイズを2に正規化するスケールを計算
  const scale = 2 / maxDim
  object.scale.multiplyScalar(scale)

  // 中心を原点に移動し、底面をy=0に配置
  // normalize前にcenterを取得しているため、スケーリング後のオフセットはscaleを掛ける必要あり
  object.position.x = -center.x * scale
  object.position.z = -center.z * scale
  object.position.y = -box.min.y * scale
}

/**
 * モデルローダーフック
 */
export const useModelLoader = (): UseModelLoaderReturn => {
  const [loadedModel, setLoadedModel] = useState<LoadedModel | null>(null)
  const [modelObject, setModelObject] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // ドラッグカウンター（ネストされた要素でのイベント発火対策）
  const [dragCounter, setDragCounter] = useState(0)

  // ドラッグ状態の更新
  useEffect(() => {
    setIsDragging(dragCounter > 0)
  }, [dragCounter])

  /**
   * ドラッグ開始イベントハンドラー
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev + 1)
  }, [])

  /**
   * ドラッグ中イベントハンドラー
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  /**
   * ドラッグ離脱イベントハンドラー
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev - 1)
  }, [])

  /**
   * ファイル読み込み処理
   * @param file 読み込むファイルオブジェクト
   */
  const loadModelFile = useCallback(async (file: File) => {
    const modelType = getModelType(file.name)
    if (!modelType) {
      setError(`対応していないファイル形式です: ${file.name}`)
      return
    }

    setIsLoading(true)
    setError(null)

    // オブジェクトURLを作成
    const url = URL.createObjectURL(file)

    try {
      // ローダーを選択して読み込み
      let object: Group

      if (modelType === 'fbx') {
        const loader = new FBXLoader()
        object = await loader.loadAsync(url)
      } else {
        const loader = new GLTFLoader()
        const gltf = await loader.loadAsync(url)
        object = gltf.scene
      }

      // モデルを正規化
      normalizeModel(object)

      // 状態を更新
      setModelObject(object)
      setLoadedModel({
        url, // 成功時のみURLを状態に保存
        type: modelType,
        name: file.name,
      })
    } catch (err) {
      console.error('モデル読み込みエラー:', err)
      setError(`モデルの読み込みに失敗しました: ${file.name}`)

      // エラー時は即座にURLを解放（メモリリーク防止）
      URL.revokeObjectURL(url)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * ドロップイベントハンドラー
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(0)

    const files = e.dataTransfer.files
    if (files.length === 0) return

    // 最初のファイルを処理
    const file = files[0]
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext && SUPPORTED_EXTENSIONS.includes(ext as typeof SUPPORTED_EXTENSIONS[number])) {
      loadModelFile(file)
    } else {
      setError(`対応していないファイル形式です。FBX, GLB, GLTFに対応しています。`)
    }
  }, [loadModelFile])

  /**
   * モデルのクリア処理
   */
  const clearModel = useCallback(() => {
    // 既存のURLを解放
    if (loadedModel?.url) {
      URL.revokeObjectURL(loadedModel.url)
    }
    setLoadedModel(null)
    setModelObject(null)
    setError(null)
  }, [loadedModel])

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (loadedModel?.url) {
        URL.revokeObjectURL(loadedModel.url)
      }
    }
  }, [loadedModel])

  return {
    loadedModel,
    modelObject,
    isLoading,
    error,
    isDragging,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearModel,
  }
}
