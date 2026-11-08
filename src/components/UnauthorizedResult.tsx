'use client';

import Link from 'next/link';
import { Button, Result } from 'antd';
import { roleHome, useSession } from '@/services/session';

interface UnauthorizedResultProps {
  title?: string;
  subTitle?: string;
}

export default function UnauthorizedResult({
  title = '403',
  subTitle = "You don't have permission to access this page.",
}: UnauthorizedResultProps) {
  const session = useSession();
  const home = session ? roleHome(session.role) : '/';

  return (
    <div style={{ padding: '48px 16px' }}>
      <Result
        status="403"
        title={title}
        subTitle={subTitle}
        extra={
          <Link href={home}>
            <Button type="primary">
              {session ? 'Go to your dashboard' : 'Go to the home page'}
            </Button>
          </Link>
        }
      />
    </div>
  );
}
