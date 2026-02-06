/**
 * ポリゴン情報表示コンポーネント
 * @description 3Dモデルのポリゴン数とマテリアル一覧を画面右上に表示
 */

import type { FC } from 'react'
import styles from './PolygonInfo.module.sass'

// ============================
// 型定義
// ============================

/**
 * PolygonInfoコンポーネントのProps
 */
interface PolygonInfoProps {
  /** 表示するポリゴン（三角形）数 */
  polygonCount: number
  /** 使用されているマテリアル名の一覧 */
  materialList: string[]
}

// ============================
// コンポーネント
// ============================

/**
 * ポリゴン情報パネル
 *
 * @description
 * 3Dモデルのメタ情報を画面右上に常時表示するパネルコンポーネント。
 * 以下の情報を表示します:
 * - ポリゴン数（三角形数）: 数値をカンマ区切りでフォーマット
 * - マテリアル一覧: カンマ区切りで全マテリアル名を表示
 *
 * @example
 * ```tsx
 * <PolygonInfo
 *   polygonCount={12450}
 *   materialList={['Wood', 'Metal', 'Glass']}
 * />
 * ```
 */
export const PolygonInfo: FC<PolygonInfoProps> = ({ polygonCount, materialList }) => {
  return (
    <div className={styles.container}>
      {/* ポリゴン数セクション */}
      <div className={styles.label}>POLYGONS</div>
      <div className={styles.value}>{polygonCount.toLocaleString()}</div>

      {/* マテリアル一覧セクション */}
      <div className={styles.materialRow}>
        <span className={styles.materialLabel}>マテリアル</span>
        <span className={styles.materialText}>
          {materialList.length > 0 ? materialList.join(', ') : '-'}
        </span>
      </div>
    </div>
  )
}
