'use client';

import { Button, Result } from 'antd';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: '48px 16px' }}>
      <Result
        status="500"
        title="Something went wrong"
        subTitle={
          error.message ||
          'The page could not be loaded. Please try again in a moment.'
        }
        extra={[
          <Button type="primary" key="retry" onClick={reset}>
            Try again
          </Button>,
          <Button key="home" href="/">
            Go to the home page
          </Button>,
        ]}
      />
    </div>
  );
}
