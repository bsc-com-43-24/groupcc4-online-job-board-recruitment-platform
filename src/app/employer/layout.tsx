import type { ReactNode } from 'react';

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return <div style={{ minHeight: 'calc(100vh - 68px)' }}>{children}</div>;
}
