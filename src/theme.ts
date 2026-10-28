import type { ThemeConfig } from 'antd';

/**
 * Shared Ant Design tokens. Every screen must pull colour, radius and spacing
 * from here (directly or through Ant Design components) instead of hard-coded
 * hex values, so the light and dark themes stay consistent.
 */
const sharedToken: ThemeConfig['token'] = {
  colorPrimary: '#2563eb',
  colorInfo: '#2563eb',
  colorSuccess: '#16a34a',
  colorWarning: '#d97706',
  colorError: '#dc2626',
  colorLink: '#2563eb',
  borderRadius: 12,
  borderRadiusLG: 16,
  controlHeight: 36,
  fontFamily:
    "'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif",
  fontSize: 15,
};

const sharedComponents: ThemeConfig['components'] = {
  Layout: {
    headerHeight: 68,
    headerPadding: '0 24px',
    footerPadding: '24px 24px',
  },
  Button: {
    controlHeight: 38,
    fontWeight: 600,
  },
  Card: {
    paddingLG: 24,
  },
  Menu: {
    itemHeight: 40,
  },
  Table: {
    headerBg: 'transparent',
  },
};

export const lightTokens: ThemeConfig = {
  token: {
    ...sharedToken,
    colorBgLayout: '#f5f7fb',
    colorBgContainer: '#ffffff',
    colorBorderSecondary: '#e9edf5',
  },
  components: sharedComponents,
};

export const darkTokens: ThemeConfig = {
  token: {
    ...sharedToken,
    colorPrimary: '#60a5fa',
    colorLink: '#60a5fa',
    colorBgLayout: '#0b1220',
    colorBgContainer: '#111a2c',
    colorBorderSecondary: '#22304a',
  },
  components: {
    ...sharedComponents,
    Table: {
      ...sharedComponents.Table,
      headerBg: '#16213a',
    },
  },
};
