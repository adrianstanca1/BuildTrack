import { Dimensions } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const COLORS = {
  // Primary
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  // Neutrals (light)
  light: {
    bg: '#ffffff',
    surface: '#f8fafc',
    elevated: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    placeholder: '#94a3b8',
    inputBg: '#ffffff',
    inputBorder: '#cbd5e1',
    cardBg: '#f8fafc',
    overlay: 'rgba(15, 23, 42, 0.5)',
  },
  // Neutrals (dark)
  dark: {
    bg: '#0f172a',
    surface: '#1e293b',
    elevated: '#334155',
    border: '#334155',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    placeholder: '#64748b',
    inputBg: '#1e293b',
    inputBorder: '#334155',
    cardBg: '#1e293b',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

export const TYPOGRAPHY = {
  display: { size: 36, weight: '700' as const, lineHeight: 44 },
  h1: { size: 30, weight: '700' as const, lineHeight: 38 },
  h2: { size: 24, weight: '600' as const, lineHeight: 32 },
  h3: { size: 20, weight: '600' as const, lineHeight: 28 },
  body: { size: 16, weight: '400' as const, lineHeight: 24 },
  bodyMedium: { size: 16, weight: '500' as const, lineHeight: 24 },
  caption: { size: 14, weight: '400' as const, lineHeight: 20 },
  captionMedium: { size: 14, weight: '500' as const, lineHeight: 20 },
  small: { size: 12, weight: '500' as const, lineHeight: 16 },
  overline: { size: 11, weight: '600' as const, lineHeight: 16, letterSpacing: 0.5 },
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.primary[600],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: { friction: 8, tension: 40 },
  bounce: { friction: 4, tension: 60 },
} as const;
