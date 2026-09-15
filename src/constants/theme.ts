export const COLORS = {
  // Brand Colors (Primary Violet #5653fe & White #ffffff)
  primary: '#5653fe',
  primaryDark: '#433efe',
  primaryLight: '#EEEDFF',
  primaryMuted: '#C7C5FF',
  secondary: '#5653fe',
  ctaBlack: '#5653fe',
  accent: '#5653fe',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Surfaces & Backgrounds
  background: '#F8FAFC',
  card: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  separator: '#F1F5F9',
  inputBackground: '#F8FAFC',

  // Tabs & Navigation
  activeTab: '#5653fe',
  inactiveTab: '#64748B',

  // Status Badges
  badgeSuccessBg: '#ECFDF5',
  badgeSuccessText: '#047857',
  badgeWarningBg: '#FFFBEB',
  badgeWarningText: '#B45309',
  badgeInfoBg: '#EFF6FF',
  badgeInfoText: '#1D4ED8',
  badgePurpleBg: '#EEEDFF',
  badgePurpleText: '#5653fe',

  // Dark Overlay
  overlay: 'rgba(15, 23, 42, 0.4)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    color: COLORS.textPrimary,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    color: COLORS.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  captionBold: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  large: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 8,
  },
};
