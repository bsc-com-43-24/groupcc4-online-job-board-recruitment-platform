'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useHydrated } from '@/hooks/useHydrated';
import { loginHref, roleHome, useSession } from '@/services/session';
import type { Role } from '@/mock/types';
import PageSkeleton from '@/components/ui/PageSkeleton';
import UnauthorizedResult from '@/components/UnauthorizedResult';

type ProtectedRouteProps = {
  children: ReactNode;
} & (
  | { role: Role; guestOnly?: false }
  | { role?: never; guestOnly: true }
);

export default function ProtectedRoute({
  children,
  role,
  guestOnly,
}: ProtectedRouteProps) {
  const hydrated = useHydrated();
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (guestOnly && session) {
      router.replace(roleHome(session.role));
      return;
    }

    if (!guestOnly && !session) {
      router.replace(
        loginHref(`${window.location.pathname}${window.location.search}`),
      );
    }
  }, [guestOnly, hydrated, router, session]);

  if (!hydrated) {
    return (
      <div style={{ maxWidth: 960, margin: '48px auto', padding: '0 16px' }}>
        <PageSkeleton rows={6} />
      </div>
    );
  }

  if (guestOnly) {
    return session ? null : children;
  }

  if (!session) {
    return (
      <div style={{ maxWidth: 960, margin: '48px auto', padding: '0 16px' }}>
        <PageSkeleton rows={6} />
      </div>
    );
  }

  if (session.role !== role) {
    return <UnauthorizedResult />;
  }

  return children;
}
