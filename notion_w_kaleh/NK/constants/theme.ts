/**
 * NK Design System — Apple Notes Dark Mode Aesthetic
 * Optimized for iPhone 13 (390 × 844 pt)
 */

export const Colors = {
  // Backgrounds
  bg: '#000000',           // Pure Black — main screen background
  card: '#1C1C1E',         // Apple Secondary Dark — cards, groups
  cardElevated: '#2C2C2E', // Slightly lighter — nested cards
  overlay: 'rgba(0,0,0,0.6)',

  // Accents
  gold: '#EBB328',         // NK Gold — primary accent
  goldMuted: 'rgba(235,179,40,0.15)', // For backgrounds/highlights
  blue: '#0A84FF',         // System Blue — secondary actions
  green: '#30D158',        // System Green — success / income
  red: '#FF453A',          // System Red — danger / expense
  purple: '#BF5AF2',       // System Purple — habits

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#3A3A3C',

  // Structural
  separator: '#38383A',
  border: 'rgba(255,255,255,0.08)',
  
  // Glassmorphism
  glass: 'rgba(28,28,30,0.85)',
  glassBorder: 'rgba(255,255,255,0.1)',
} as const;

export const Typography = {
  // SF Pro — System font on iOS, falls back to Roboto on Android
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

export const Animation = {
  spring: {
    type: 'spring' as const,
    damping: 15,
    stiffness: 150,
    mass: 0.8,
  },
  springSnappy: {
    type: 'spring' as const,
    damping: 20,
    stiffness: 300,
    mass: 0.6,
  },
  timing: {
    duration: 250,
  },
} as const;
