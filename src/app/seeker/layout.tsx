import type { ReactNode } from 'react';

export default function SeekerLayout({ children }: { children: ReactNode }) {
  return <div style={{ minHeight: 'calc(100vh - 68px)' }}>{children}</div>;
}
