'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useHydrated } from '@/hooks/useHydrated';
import {
  isLoginRedirectPending,
  loginHref,
  roleHome,
  safeNextPath,
  useSession,
} from '@/services/session';
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
      const next = safeNextPath(
        new URLSearchParams(window.location.search).get('next'),
      );
      const rolePrefix =
        session.role === 'ADMIN'
          ? '/admin/'
          : session.role === 'EMPLOYER'
            ? '/employer/'
            : '/seeker/';
      const destination =
        next &&
        (next === roleHome(session.role) || next.startsWith(rolePrefix))
          ? next
          : roleHome(session.role);
      router.replace(destination);
      return;
    }

    if (!guestOnly && !session && !isLoginRedirectPending()) {
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
