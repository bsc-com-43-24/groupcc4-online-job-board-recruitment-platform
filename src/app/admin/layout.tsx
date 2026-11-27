import type { ReactNode } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute role="ADMIN">
      <div style={{ minHeight: 'calc(100vh - 68px)' }}>{children}</div>
    </ProtectedRoute>
  );
}
