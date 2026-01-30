// 8px grid system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Edge margins for tablet display
export const layout = {
  edgeMargin: 48,
  cardPadding: 24,
  sectionGap: 32,

  // Touch targets (minimum for tablet)
  minTouchTarget: 48,

  // Calendar overlay
  calendarWidth: 480,

  // Voice indicator
  voiceIndicatorSize: 120,

  // Screen dimensions (target device)
  screenWidth: 1920,
  screenHeight: 1200,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type SpacingName = keyof typeof spacing;
export type LayoutName = keyof typeof layout;
