import type { CSSProperties, ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  /** Maximum content width in pixels. */
  maxWidth?: number;
  style?: CSSProperties;
}

/**
 * Consistent page width and padding for every screen.
 *
 * The old shell applied `padding: 24` globally, which double-padded full-bleed
 * sections and made widths inconsistent between pages.
 */
export default function PageContainer({
  children,
  maxWidth = 1200,
  style,
}: PageContainerProps) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth,
        margin: '0 auto',
        padding: '24px 16px 56px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
