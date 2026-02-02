/**
 * アコーディオンコンポーネント
 * @description 折りたたみ可能なセクションを提供
 * 
 * @example
 * ```tsx
 * <Accordion title="🎨 背景設定">
 *   <ColorPicker />
 * </Accordion>
 * ```
 */

import { useState, useCallback } from 'react'
import type { FC, ReactNode } from 'react'
import styles from './Accordion.module.sass'

/**
 * Accordionコンポーネントのprops
 */
interface AccordionProps {
  /** セクションタイトル */
  title: string
  /** 子要素 */
  children: ReactNode
  /** 初期状態で開いているか */
  defaultOpen?: boolean
}

/**
 * アコーディオンコンポーネント
 * 
 * クリックで開閉するセクション。
 * アニメーション付きでスムーズに開閉する。
 * 
 * @param props - コンポーネントProps
 * @returns アコーディオンセクション
 */
export const Accordion: FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  // 開閉状態
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // トグルハンドラー
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return (
    <div className={styles.accordion}>
      {/* ヘッダー（クリックで開閉） */}
      <button
        type="button"
        className={styles.header}
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <span className={styles.title}>{title}</span>
        <span className={`${styles.icon} ${isOpen ? styles.open : ''}`}>
          ▼
        </span>
      </button>

      {/* コンテンツ（開閉アニメーション） */}
      <div className={`${styles.content} ${isOpen ? styles.expanded : ''}`}>
        <div className={styles.inner}>
          {children}
        </div>
      </div>
    </div>
  )
}
