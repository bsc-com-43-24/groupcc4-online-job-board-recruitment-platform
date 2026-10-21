'use client';

import { Layout, Menu } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Header, Content, Footer } = Layout;

const items = [
  { key: '/', label: <Link href="/">Home</Link> },
  { key: '/seeker/jobs/job-101', label: <Link href="/seeker/jobs/job-101">Jobs</Link> },
  { key: '/applications', label: <Link href="/applications">My Applications</Link> },
  { key: '/employer/jobs', label: <Link href="/employer/jobs">Employer</Link> },
  { key: '/auth/login', label: <Link href="/auth/login">Login</Link> },
  { key: '/register', label: <Link href="/register">Register</Link> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      
      <Content style={{ padding: 24 }}>{children}</Content>
      <Footer style={{ textAlign: 'center' }}>Online Job Board · Apply Now</Footer>
    </Layout>
  );
}
