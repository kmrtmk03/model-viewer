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
 * @description シーンに適用するポストプロセッシングエフェクトの設定
 * 
 * EffectComposer（@react-three/postprocessing）で使用される各エフェクトの
 * 有効/無効とパラメータを管理する。
 * 
 * @example
 * ```typescript
 * const postEffects: PostEffectSettings = {
 *   bloomEnabled: true,
 *   bloomIntensity: 1.5,
 *   // ...その他設定
 * }
 * ```
 */
export interface PostEffectSettings {
  // ==========================================
  // Bloom（発光効果）
  // 明るい部分を拡散させてグロー効果を生成
  // ==========================================

  /** 
   * Bloom有効フラグ
   * @default false
   */
  bloomEnabled: boolean

  /** 
   * Bloom強度
   * 発光の明るさを制御。値が大きいほど強い発光
   * @default 1.0
   * @range 0 - 3
   */
  bloomIntensity: number

  /** 
   * Bloomしきい値
   * この輝度以上のピクセルのみ発光。値が大きいほど明るい部分のみ発光
   * @default 0.9
   * @range 0 - 1
   */
  bloomThreshold: number

  // ==========================================
  // Vignette（周辺減光）
  // 画面の端を暗くして中央に注目させる効果
  // ==========================================

  /** 
   * Vignette有効フラグ
   * @default false
   */
  vignetteEnabled: boolean

  /** 
   * Vignetteオフセット
   * 減光開始位置。値が小さいほど中央から減光開始
   * @default 0.5
   * @range 0 - 1
   */
  vignetteOffset: number

  /** 
   * Vignette暗さ
   * 周辺の暗さ。値が大きいほど暗い
   * @default 0.5
   * @range 0 - 1
   */
  vignetteDarkness: number

  // ==========================================
  // ToneMapping（色調マッピング）
  // HDR→LDR変換時の色調補正（ACES Filmic使用）
  // ==========================================

  /** 
   * ToneMapping有効フラグ
   * ACES Filmic色調マッピングを適用。映画的な色彩表現
   * @default false
   */
  toneMappingEnabled: boolean

  // ==========================================
  // SMAA（アンチエイリアシング）
  // ジャギー（ギザギザ）を滑らかにする
  // ==========================================

  /** 
   * SMAA有効フラグ
   * 高品質なアンチエイリアシング。エッジを滑らかに表示
   * @default true
   */
  smaaEnabled: boolean

  // ==========================================
  // HueSaturation（色相・彩度調整）
  // シーン全体の色味を調整
  // ==========================================

  /** 
   * HueSaturation有効フラグ
   * @default false
   */
  hueSaturationEnabled: boolean

  /** 
   * 色相調整
   * 色相を回転（-1でマイナス方向、+1でプラス方向に360度回転）
   * @default 0
   * @range -1 - 1
   */
  hue: number

  /** 
   * 彩度調整
   * -1で完全なグレースケール、+1で鮮やかに
   * @default 0
   * @range -1 - 1
   */
  saturation: number

  // ==========================================
  // DepthOfField（被写界深度）
  // カメラのピント・ボケを再現
  // ==========================================

  /** 
   * DepthOfField有効フラグ
   * @default false
   */
  depthOfFieldEnabled: boolean

  /** 
   * フォーカス距離
   * ピントを合わせる距離。0がカメラ直近
   * @default 0.02
   * @range 0 - 10
   */
  focusDistance: number

  /** 
   * 焦点距離
   * 被写界深度の深さ。値が大きいほどピント範囲が狭い
   * @default 0.5
   * @range 0 - 1
   */
  focalLength: number

  /** 
   * ボケスケール
   * ボケの大きさ。値が大きいほど大きなボケ
   * @default 2
   * @range 0 - 10
   */
  bokehScale: number

  // ==========================================
  // ColorAverage（モノクロ化）
  // シーンをグレースケールに変換
  // ==========================================

  /** 
   * ColorAverage有効フラグ
   * シーン全体をモノクロ（グレースケール）に変換
   * @default false
   */
  colorAverageEnabled: boolean

  // ==========================================
  // Pixelation（ピクセル化）
  // レトロゲーム風のピクセルアート効果
  // ==========================================

  /** 
   * Pixelation有効フラグ
   * @default false
   */
  pixelationEnabled: boolean

  /** 
   * ピクセル粒度
   * ピクセルサイズ。値が大きいほど粗いピクセル
   * @default 5
   * @range 1 - 20
   */
  pixelationGranularity: number

  // ==========================================
  // DotScreen（網点効果）
  // 印刷物のようなハーフトーン効果
  // ==========================================

  /** 
   * DotScreen有効フラグ
   * @default false
   */
  dotScreenEnabled: boolean

  /** 
   * ドットスケール
   * 網点の大きさ。値が大きいほど大きなドット
   * @default 1.0
   * @range 0.5 - 3
   */
  dotScreenScale: number
}


