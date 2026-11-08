'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button, Result } from 'antd';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: '48px 16px' }}>
      <Result
        status="500"
        title="Something went wrong"
        subTitle="The page could not be loaded. Please try again in a moment."
        extra={[
          <Button type="primary" key="retry" onClick={reset}>
            Try again
          </Button>,
          <Link href="/" key="home">
            <Button>Go to the home page</Button>
          </Link>,
        ]}
      />
    </div>
  );
}
