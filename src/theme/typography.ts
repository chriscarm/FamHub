import { TextStyle } from 'react-native';

export const fontFamily = {
  light: 'Inter-Light',
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
} as const;

export const typography: Record<string, TextStyle> = {
  // Display - for large decorative text
  display: {
    fontFamily: fontFamily.light,
    fontSize: 96,
    letterSpacing: -1.5,
    lineHeight: 112,
  },

  // Headline - for section titles
  headline1: {
    fontFamily: fontFamily.regular,
    fontSize: 48,
    letterSpacing: -0.5,
    lineHeight: 56,
  },

  headline2: {
    fontFamily: fontFamily.regular,
    fontSize: 32,
    letterSpacing: 0,
    lineHeight: 40,
  },

  headline3: {
    fontFamily: fontFamily.medium,
    fontSize: 24,
    letterSpacing: 0,
    lineHeight: 32,
  },

  // Body text
  body1: {
    fontFamily: fontFamily.regular,
    fontSize: 18,
    letterSpacing: 0.15,
    lineHeight: 28,
  },

  body2: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    letterSpacing: 0.25,
    lineHeight: 24,
  },

  // Smaller text
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    letterSpacing: 0.4,
    lineHeight: 20,
  },

  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.5,
    lineHeight: 16,
  },

  // Button text
  button: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    letterSpacing: 0.5,
    lineHeight: 24,
    textTransform: 'uppercase',
  },
} as const;

export type TypographyName = keyof typeof typography;
