/**
 * アコーディオンコンポーネント
 * @description 折りたたみ可能なセクションを提供
 * 
 * クリックで開閉し、スムーズなアニメーションで
 * コンテンツを表示/非表示にする。
 * 
 * 構造:
 * - ヘッダー: タイトルとトグルアイコン（クリック可能）
 * - コンテンツ: 子要素を格納（開閉アニメーション付き）
 * 
 * @example
 * ```tsx
 * <Accordion title="🎨 背景設定" defaultOpen={true}>
 *   <ColorPicker />
 * </Accordion>
 * ```
 */

import type { FC, ReactNode } from 'react'
import { useAccordion } from './hooks/useAccordion'
import styles from './Accordion.module.sass'

// ============================================
// 型定義
// ============================================

/**
 * Accordionコンポーネントのprops
 */
interface AccordionProps {
  /** 
   * セクションタイトル
   * 絵文字を含めることで視覚的に識別しやすくなる
   * @example "🎨 背景設定"
   */
  title: string
  /** 子要素（折りたたまれるコンテンツ） */
  children: ReactNode
  /** 
   * 初期状態で開いているか
   * @default false
   */
  defaultOpen?: boolean
}

// ============================================
// コンポーネント
// ============================================

/**
 * アコーディオンコンポーネント
 * 
 * ビューに専念し、開閉ロジックはuseAccordionフックに委譲。
 * aria-expanded属性でアクセシビリティを確保。
 * 
 * @param props - コンポーネントProps
 * @returns アコーディオンセクション
 */
export const Accordion: FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  // 開閉ロジックはカスタムフックに委譲
  const { isOpen, toggle } = useAccordion(defaultOpen)

  return (
    <div className={styles.accordion}>
      {/* ヘッダー（クリックで開閉） */}
      <button
        type="button"
        className={styles.header}
        onClick={toggle}
        aria-expanded={isOpen}
      >
        <span className={styles.title}>{title}</span>
        {/* トグルアイコン（開閉状態に応じて回転） */}
        <span className={`${styles.icon} ${isOpen ? styles.open : ''}`}>
          ▼
        </span>
      </button>

      {/* コンテンツ（max-heightアニメーションで開閉） */}
      <div className={`${styles.content} ${isOpen ? styles.expanded : ''}`}>
        <div className={styles.inner}>
          {children}
        </div>
      </div>
    </div>
  )
}

