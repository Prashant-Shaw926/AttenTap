/**
 * FocusFruit Design System
 * Single source of truth for all visual tokens.
 */

// ─── Colors ────────────────────────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  bgApp: '#080C18',
  bgBoard: '#F4F1EC',
  bgRail: '#0C1022',
  bgOverlay: 'rgba(244, 241, 236, 0.92)',

  // Surfaces
  surfaceLight: 'rgba(255, 255, 255, 0.94)',
  surfaceDark: '#111826',
  surfaceMid: 'rgba(255, 255, 255, 0.14)',

  // Brand / accent
  accent: '#FF7043',        // warm coral – primary CTA
  accentSoft: '#FFDDD4',
  accentDark: '#C94E29',

  // Semantic
  success: '#52C97A',
  successSoft: 'rgba(82, 201, 122, 0.18)',
  error: '#F4645C',
  errorSoft: 'rgba(244, 100, 92, 0.14)',
  warning: '#F5A623',
  info: '#5B9BF5',

  // Target ring on fruit
  targetRing: 'rgba(91, 155, 245, 0.32)',

  // Text
  textPrimary: '#EAEEF8',
  textSecondary: '#8A96AE',
  textOnLight: '#161D2C',
  textOnLightMuted: '#566170',
  textAccent: '#FF7043',

  // Borders
  borderLight: 'rgba(255, 255, 255, 0.10)',
  borderOnLight: 'rgba(22, 29, 44, 0.10)',

  // Timer low-state
  timerLow: '#F4645C',
  timerLowBg: 'rgba(244, 100, 92, 0.10)',
} as const

// ─── Typography ────────────────────────────────────────────────────────────

export const Typography = {
  // Weights
  weightRegular: '400' as const,
  weightMedium: '600' as const,
  weightBold: '700' as const,
  weightBlack: '800' as const,

  // Sizes
  xs: 10,
  sm: 12,
  base: 15,
  md: 17,
  lg: 22,
  xl: 28,
  xxl: 40,
  display: 64,
  giant: 112,

  // Letter spacing helpers
  caps: 2.0,
  capsTight: 1.2,

  // Line heights
  tight: 1.1,
  normal: 1.5,
  relaxed: 1.65,
} as const

// ─── Spacing ───────────────────────────────────────────────────────────────

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
  section: 56,
} as const

// ─── Radii ─────────────────────────────────────────────────────────────────

export const Radius = {
  sm: 10,
  md: 18,
  lg: 26,
  xl: 36,
  pill: 999,
} as const

// ─── Shadows ───────────────────────────────────────────────────────────────

export const Shadows = {
  button: {
    shadowColor: '#FF7043',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 5,
  },
  fruit: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
} as const

// ─── Touch Targets ─────────────────────────────────────────────────────────

export const Touch = {
  minSize: 56,      // minimum accessible touch target
  iconButton: 72,   // sidebar/HUD icon buttons
  hitSlop: 10,
} as const

// ─── Game Board ────────────────────────────────────────────────────────────

export const Board = {
  railWidthPercent: '18%' as const,
  borderRadius: Radius.xl,
  padding: Spacing.md,
} as const