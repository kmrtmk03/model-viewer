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
  /** ディレクショナルライト有効 */
  directionalLightEnabled: boolean
  /** ディレクショナルライトの色 */
  directionalLightColor: string
  /** ディレクショナルライトの強度 */
  directionalLightIntensity: number
  /** 選択中のHDRIインデックス */
  hdriIndex: number
  /** HDRI回転角度（度） */
  hdriRotation: number
  /** HDRI環境光の強度 */
  hdriIntensity: number
  /** HDRI有効フラグ */
  hdriEnabled: boolean
  /** 背景モード */
  backgroundMode: 'color' | 'hdri'
  /** ポストエフェクト設定 */
  postEffects: PostEffectSettings
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

/**
 * 読み込まれたモデルの情報
 */
export interface LoadedModel {
  /** オブジェクトURL */
  url: string
  /** モデルタイプ */
  type: 'fbx' | 'gltf'
  /** ファイル名 */
  name: string
}

/**
 * ポストエフェクト設定
 */
export interface PostEffectSettings {
  // Bloom（発光効果）
  /** Bloom有効 */
  bloomEnabled: boolean
  /** Bloom強度 */
  bloomIntensity: number
  /** Bloomしきい値 */
  bloomThreshold: number

  // Vignette（周辺減光）
  /** Vignette有効 */
  vignetteEnabled: boolean
  /** Vignetteオフセット */
  vignetteOffset: number
  /** Vignette暗さ */
  vignetteDarkness: number

  // ToneMapping（色調マッピング）
  /** ToneMapping有効 */
  toneMappingEnabled: boolean

  // SMAA（アンチエイリアシング）
  /** SMAA有効 */
  smaaEnabled: boolean

  // HueSaturation（色相・彩度）
  /** HueSaturation有効 */
  hueSaturationEnabled: boolean
  /** 色相調整 (-1 to 1) */
  hue: number
  /** 彩度調整 (-1 to 1) */
  saturation: number

  // DepthOfField（被写界深度）
  /** DepthOfField有効 */
  depthOfFieldEnabled: boolean
  /** フォーカス距離 */
  focusDistance: number
  /** 焦点距離 */
  focalLength: number
  /** ボケスケール */
  bokehScale: number

  // ColorAverage（モノクロ化）
  /** ColorAverage有効 */
  colorAverageEnabled: boolean

  // Pixelation（ピクセル化）
  /** Pixelation有効 */
  pixelationEnabled: boolean
  /** ピクセル粒度 */
  pixelationGranularity: number

  // DotScreen（網点効果）
  /** DotScreen有効 */
  dotScreenEnabled: boolean
  /** ドットスケール */
  dotScreenScale: number
}

