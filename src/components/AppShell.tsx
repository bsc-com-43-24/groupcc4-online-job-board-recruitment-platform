'use client';

import Link from 'next/link';
import { Layout, Space } from 'antd';
import SiteHeader from './SiteHeader';

export default function AppShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--app-bg)' }}>
      <SiteHeader />
      <main id="main-content" style={{ flex: 1 }}>
        {children}
      </main>
      <Layout.Footer
        style={{
          textAlign: 'center',
          background: 'transparent',
          borderTop: '1px solid var(--app-border)',
          padding: '24px 16px',
        }}
      >
        <Space size={16} wrap style={{ justifyContent: 'center' }}>
          <Link href="/seeker/jobs">Browse jobs</Link>
          <Link href="/login">Log in</Link>
          <Link href="/register">Create an account</Link>
        </Space>
        <div style={{ marginTop: 8, opacity: 0.65, fontSize: 13 }}>
          Online Job Board &amp; Recruitment Platform · Group CC4 · COM311
        </div>
      </Layout.Footer>
    </Layout>
  );
}
