/**
 * ビューア機能の型定義
 * @description 3Dモデルビューアーで使用する型を定義
 */

/**
 * HDRIアイテムの型
 */
export interface HdriItem {
  /** ID */
  id: number
  /** 表示名 */
  name: string
  /** ファイルパス */
  path: string
}

/**
 * モデルの情報
 */
export interface ModelInfo {
  /** モデル名 */
  name: string
  /** モデルファイルのパス */
  path: string
  /** スケール倍率 */
  scale?: number
}

/**
 * ビューアーの設定
 */
export interface ViewerSettings {
  /** ワイヤーフレーム表示 */
  wireframe: boolean
  /** グリッド表示 */
  showGrid: boolean
  /** 軸ヘルパー表示 */
  showAxes: boolean
  /** 背景色 */
  backgroundColor: string
  /** 自動回転 */
  autoRotate: boolean
  /** ライト方位角（度） - 水平方向の角度 */
  lightAzimuth: number
  /** ライト仰角（度） - 垂直方向の角度 */
  lightElevation: number
  /** ライト距離 */
  lightDistance: number
  /** 選択中のHDRIインデックス */
  hdriIndex: number
  /** HDRI回転角度（度） */
  hdriRotation: number
}

/**
 * カメラ設定
 */
export interface CameraSettings {
  /** カメラ位置 */
  position: [number, number, number]
  /** FOV (視野角) */
  fov: number
  /** ニアクリップ */
  near: number
  /** ファークリップ */
  far: number
}

/**
 * ライティング設定
 */
export interface LightingSettings {
  /** 環境光の強度 */
  ambientIntensity: number
  /** ディレクショナルライトの強度 */
  directionalIntensity: number
  /** ディレクショナルライトの位置 */
  directionalPosition: [number, number, number]
}
