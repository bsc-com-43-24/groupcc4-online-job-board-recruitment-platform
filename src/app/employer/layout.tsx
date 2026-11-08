import type { ReactNode } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute role="EMPLOYER">
      <div style={{ minHeight: 'calc(100vh - 68px)' }}>{children}</div>
    </ProtectedRoute>
  );
}
