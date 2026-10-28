import Link from 'next/link';
import { Button, Result } from 'antd';

export default function NotFound() {
  return (
    <div style={{ padding: '48px 16px' }}>
      <Result
        status="404"
        title="Page not found"
        subTitle="The page you were looking for does not exist or has moved."
        extra={[
          <Link href="/" key="home">
            <Button type="primary">Go to the home page</Button>
          </Link>,
          <Link href="/seeker/jobs" key="jobs">
            <Button>Browse jobs</Button>
          </Link>,
        ]}
      />
    </div>
  );
}
