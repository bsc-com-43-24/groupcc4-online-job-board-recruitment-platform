'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { Role } from '@/mock/types';

export default function EmployerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const role: Role | Role[] =
    pathname === '/employer/verification'
      ? ['EMPLOYER', 'JOB_SEEKER']
      : 'EMPLOYER';

  return (
    <ProtectedRoute role={role}>
      <div style={{ minHeight: 'calc(100vh - 68px)' }}>{children}</div>
    </ProtectedRoute>
  );
}
