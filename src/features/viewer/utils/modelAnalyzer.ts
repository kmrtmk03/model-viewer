/**
 * 3Dモデル解析ユーティリティ
 * @description モデルのポリゴン数やマテリアル情報を取得するための純粋関数群
 *
 * このモジュールは以下の機能を提供します:
 * - ジオメトリからの三角形数カウント
 * - Object3D階層全体のポリゴン数集計
 * - マテリアル情報の抽出とラベル生成
 */

import type { BufferGeometry, Material, Mesh, Object3D } from 'three'

// ============================
// 型ガード関数
// ============================

/**
 * Object3DがMeshかどうかを判定する型ガード
 * @param object - 判定対象のObject3D
 * @returns Meshの場合true
 */
export const isMesh = (object: Object3D): object is Mesh => {
  return 'isMesh' in object && (object as Mesh).isMesh === true
}

// ============================
// ポリゴン数計算
// ============================

/**
 * ジオメトリから三角形数を取得
 *
 * @description
 * BufferGeometryの構造に基づいて三角形数を計算します。
 * - インデックス付きジオメトリ: index.count / 3
 * - 非インデックスジオメトリ: position.count / 3
 *
 * @param geometry - 対象のBufferGeometry
 * @returns 三角形の数（整数）
 *
 * @example
 * const geometry = new BoxGeometry(1, 1, 1)
 * const triangles = getTriangleCountFromGeometry(geometry) // 12
 */
export const getTriangleCountFromGeometry = (geometry: BufferGeometry): number => {
  // インデックス付きジオメトリの場合
  // 3頂点で1つの三角形を構成するため、index.countを3で割る
  if (geometry.index) {
    return Math.floor(geometry.index.count / 3)
  }

  // 非インデックスジオメトリの場合
  // position属性の頂点数を3で割って三角形数を算出
  const positionAttribute = geometry.getAttribute('position')
  if (!positionAttribute) {
    return 0
  }

  return Math.floor(positionAttribute.count / 3)
}

/**
 * Object3D配下の総三角形数を取得
 *
 * @description
 * Object3Dの階層構造を再帰的に走査し、
 * 全てのMeshのジオメトリから三角形数を集計します。
 *
 * @param object - 対象のObject3D（GroupやSceneなど）
 * @returns 総三角形数
 *
 * @example
 * const model = await loader.loadAsync('model.glb')
 * const totalTriangles = getTriangleCountFromObject(model)
 */
export const getTriangleCountFromObject = (object: Object3D): number => {
  let total = 0

  // traverse: Object3D配下の全ノードを再帰的に処理
  object.traverse((child) => {
    if (isMesh(child) && child.geometry) {
      total += getTriangleCountFromGeometry(child.geometry as BufferGeometry)
    }
  })

  return total
}

// ============================
// マテリアル情報取得
// ============================

/**
 * Materialを表示用ラベルに変換
 *
 * @description
 * マテリアルの名前が設定されている場合はその名前を、
 * 未設定の場合はマテリアルタイプ（例: MeshStandardMaterial）を返します。
 *
 * @param material - 対象のMaterial
 * @returns 表示用ラベル文字列
 */
export const getMaterialLabel = (material: Material): string => {
  const materialName = material.name?.trim()
  // 名前が設定されていれば優先、なければタイプ名を使用
  return materialName ? materialName : material.type
}

/**
 * Object3D配下で使用されているマテリアル一覧（ユニーク）を取得
 *
 * @description
 * Object3Dの階層を走査し、全Meshで使用されているマテリアルを収集します。
 * 重複は除去され、ユニークなマテリアルラベルの配列として返されます。
 *
 * @param object - 対象のObject3D
 * @returns ユニークなマテリアルラベルの配列
 *
 * @example
 * const materials = getMaterialListFromObject(model)
 * // ['Wood_Material', 'Metal_Material', 'Glass']
 */
export const getMaterialListFromObject = (object: Object3D): string[] => {
  // Setを使用して重複を自動的に除去
  const materialSet = new Set<string>()

  object.traverse((child) => {
    if (!isMesh(child)) return

    // マテリアルは単一または配列の両方の形式がある
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach((material) => {
      if (material) {
        materialSet.add(getMaterialLabel(material as Material))
      }
    })
  })

  return Array.from(materialSet)
}
