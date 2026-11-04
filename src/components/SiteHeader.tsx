'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  App as AntApp,
  Avatar,
  Button,
  Divider,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  Space,
  Tooltip,
  theme,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Plus,
  RefreshCcw,
  Sun,
  UserRound,
  Users,
} from 'lucide-react';
import { clearSession, roleHome, useSession } from '@/services/session';
import { resetMockStore } from '@/mock/store';
import { useThemeMode } from './ThemeProvider';

const { Header } = Layout;

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const ICON_SIZE = 16;

const ANONYMOUS_NAV: NavItem[] = [
  {
    key: '/seeker/jobs',
    label: 'Browse jobs',
    icon: <BriefcaseBusiness size={ICON_SIZE} aria-hidden />,
  },
];

const SEEKER_NAV: NavItem[] = [
  {
    key: '/seeker/jobs',
    label: 'Browse jobs',
    icon: <BriefcaseBusiness size={ICON_SIZE} aria-hidden />,
  },
  {
    key: '/seeker/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={ICON_SIZE} aria-hidden />,
  },
  {
    key: '/seeker/applications',
    label: 'Applications',
    icon: <FileText size={ICON_SIZE} aria-hidden />,
  },
  {
    key: '/seeker/profile',
    label: 'Profile',
    icon: <UserRound size={ICON_SIZE} aria-hidden />,
  },
];

const EMPLOYER_NAV: NavItem[] = [
  {
    key: '/employer/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={ICON_SIZE} aria-hidden />,
  },
  {
    key: '/employer/jobs',
    label: 'My jobs',
    icon: <BriefcaseBusiness size={ICON_SIZE} aria-hidden />,
  },
  {
    key: '/employer/applicants',
    label: 'Applicants',
    icon: <Users size={ICON_SIZE} aria-hidden />,
  },
];

function resolveActiveKey(pathname: string, items: NavItem[]): string | undefined {
  const match = items
    .filter(
      (item) => pathname === item.key || pathname.startsWith(`${item.key}/`),
    )
    .sort((a, b) => b.key.length - a.key.length)[0];

  return match?.key;
}

export default function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const session = useSession();
  const { mode, toggle } = useThemeMode();
  const { message, modal } = AntApp.useApp();
  const { token } = theme.useToken();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = useMemo(() => {
    if (!session) {
      return ANONYMOUS_NAV;
    }
    return session.role === 'EMPLOYER' ? EMPLOYER_NAV : SEEKER_NAV;
  }, [session]);

  const activeKey = resolveActiveKey(pathname, navItems);

  const menuItems: MenuProps['items'] = navItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
  }));

  const navigate = (key: string) => {
    setDrawerOpen(false);
    router.push(key);
  };

  const handleLogout = () => {
    clearSession();
    message.success('You have been signed out.');
    router.push('/login');
    router.refresh();
  };

  const handleResetDemo = () => {
    modal.confirm({
      title: 'Reset demo data?',
      content:
        'This restores the sample jobs, applications and profiles, and removes anything you added in this browser.',
      okText: 'Reset data',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => {
        resetMockStore();
        message.success('Demo data restored.');
        router.refresh();
      },
    });
  };

  const accountItems: MenuProps['items'] = session
    ? [
        {
          key: 'account-summary',
          disabled: true,
          label: (
            <div style={{ padding: '4px 0' }}>
              <div style={{ fontWeight: 600 }}>{session.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {session.role === 'EMPLOYER' ? 'Employer account' : 'Job seeker account'}
              </div>
            </div>
          ),
        },
        { type: 'divider' },
        {
          key: roleHome(session.role),
          label: 'Dashboard',
          icon: <LayoutDashboard size={ICON_SIZE} aria-hidden />,
        },
        session.role === 'EMPLOYER'
          ? {
              key: '/employer/jobs/new',
              label: 'Post a job',
              icon: <Plus size={ICON_SIZE} aria-hidden />,
            }
          : {
              key: '/seeker/profile',
              label: 'My profile',
              icon: <UserRound size={ICON_SIZE} aria-hidden />,
            },
        { type: 'divider' },
        {
          key: 'reset-demo',
          label: 'Reset demo data',
          icon: <RefreshCcw size={ICON_SIZE} aria-hidden />,
        },
        {
          key: 'logout',
          label: 'Log out',
          danger: true,
          icon: <LogOut size={ICON_SIZE} aria-hidden />,
        },
      ]
    : [];

  const handleAccountClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
      return;
    }
    if (key === 'reset-demo') {
      handleResetDemo();
      return;
    }
    if (key.startsWith('/')) {
      router.push(key);
    }
  };

  const themeToggle = (
    <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      <Button
        type="text"
        aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggle}
        icon={
          mode === 'dark' ? (
            <Sun size={18} aria-hidden />
          ) : (
            <Moon size={18} aria-hidden />
          )
        }
      />
    </Tooltip>
  );

  const authActions = session ? (
    <Dropdown
      menu={{ items: accountItems, onClick: handleAccountClick }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button type="text" style={{ height: 40, paddingInline: 8 }}>
        <Space size={8}>
          <Avatar size={28} style={{ backgroundColor: token.colorPrimary }}>
            {session.name.charAt(0).toUpperCase()}
          </Avatar>
          <span className="site-header-account-name" style={{ fontWeight: 600 }}>
            {session.name.split(' ')[0]}
          </span>
        </Space>
      </Button>
    </Dropdown>
  ) : (
    <span className="site-nav-desktop">
      <Space size={8}>
        <Link href="/login">
          <Button>Log in</Button>
        </Link>
        <Link href="/register">
          <Button type="primary">Register</Button>
        </Link>
      </Space>
    </span>
  );

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Button
        className="site-nav-mobile"
        type="text"
        aria-label="Open navigation menu"
        onClick={() => setDrawerOpen(true)}
        icon={<MenuIcon size={20} aria-hidden />}
      />

      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 800,
          fontSize: 18,
          whiteSpace: 'nowrap',
        }}
      >
        <span
          aria-hidden
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 10,
            background: token.colorPrimary,
            color: '#fff',
          }}
        >
          <BriefcaseBusiness size={18} />
        </span>
        JobBoard
      </Link>

      <nav aria-label="Main" className="site-nav-desktop" style={{ flex: 1, minWidth: 0 }}>
        <Menu
          mode="horizontal"
          selectedKeys={activeKey ? [activeKey] : []}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderBottom: 'none', background: 'transparent', minWidth: 0 }}
        />
      </nav>

      <Space size={8} style={{ marginLeft: 'auto' }}>
        {session?.role === 'EMPLOYER' ? (
          <Link href="/employer/jobs/new" className="site-nav-desktop">
            <Button type="primary" icon={<Plus size={16} aria-hidden />}>
              Post a job
            </Button>
          </Link>
        ) : null}
        {themeToggle}
        {authActions}
      </Space>

      <Drawer
        title="Navigation"
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size="default"
      >
        <Menu
          mode="inline"
          selectedKeys={activeKey ? [activeKey] : []}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderInlineEnd: 'none' }}
        />
        <Divider />
        <Space direction="vertical" style={{ width: '100%' }} size={8}>
          {session ? (
            <>
              <div style={{ fontWeight: 600 }}>{session.name}</div>
              <Button
                block
                icon={<LogOut size={16} aria-hidden />}
                onClick={() => {
                  setDrawerOpen(false);
                  handleLogout();
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setDrawerOpen(false)}>
                <Button block>Log in</Button>
              </Link>
              <Link href="/register" onClick={() => setDrawerOpen(false)}>
                <Button block type="primary">
                  Register
                </Button>
              </Link>
            </>
          )}
        </Space>
      </Drawer>
    </Header>
  );
}
