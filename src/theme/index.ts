export { colors, type ColorName } from './colors';
export { typography, fontFamily, type TypographyName } from './typography';
export { spacing, layout, borderRadius, type SpacingName, type LayoutName } from './spacing';

// Combined theme object for convenience
export const theme = {
  colors: require('./colors').colors,
  typography: require('./typography').typography,
  fontFamily: require('./typography').fontFamily,
  spacing: require('./spacing').spacing,
  layout: require('./spacing').layout,
  borderRadius: require('./spacing').borderRadius,
} as const;
