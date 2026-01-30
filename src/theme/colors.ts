export const colors = {
  // Base colors (Cozy Warm Dark)
  background: '#1C1C1E', // Warm charcoal
  surface: '#2C2C2E',     // Lighter warm grey
  surfaceLight: '#3A3A3C', // Element bg
  
  // Text
  textPrimary: '#F2F2F7', // Soft white
  textSecondary: '#AEAEB2', // Muted grey
  textTertiary: '#636366', // Darker grey

  // Person colors (Muted/Cozy versions)
  chris: '#5AA7BD',      // Muted Teal
  christy: '#E3B587',    // Muted Warm Gold

  // Semantic
  success: '#34C759',
  error: '#FF453A',
  warning: '#FFD60A',

  // Voice indicator
  voiceActive: '#5AA7BD',
  voicePulse: 'rgba(90, 167, 189, 0.3)',

  // Calendar
  calendarBackground: '#2C2C2E',
  calendarToday: '#3A3A3C',
  calendarSelected: '#48484A',
  calendarDayText: '#F2F2F7',
  calendarMonthText: '#F2F2F7',
  calendarArrow: '#E3B587', // Use Christy's gold for warmth

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.75)',
} as const;

export type ColorName = keyof typeof colors;
