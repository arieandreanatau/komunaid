export const colors = {
  navy: {
    DEFAULT: '#0A1D4D',
    50: '#E8EBF3',
    100: '#C5CCE3',
    200: '#9EABC9',
    300: '#7084AB',
    400: '#4A6393',
    500: '#0A1D4D',
    600: '#1A3A9E',
    700: '#0A1D4D',
    800: '#081638',
    900: '#040B1D',
  },
  royal: {
    DEFAULT: '#1D4ED8',
    50: '#EBF0FD',
    100: '#D1DEF9',
    200: '#A3BDF3',
    300: '#759CED',
    400: '#477BE7',
    500: '#1D4ED8',
    600: '#1740B5',
    700: '#113192',
    800: '#0B226F',
    900: '#05134C',
  },
  teal: {
    DEFAULT: '#11A79B',
    50: '#E6F7F6',
    100: '#C0ECE9',
    200: '#81D9D3',
    300: '#42C6BD',
    400: '#1BB8AF',
    500: '#11A79B',
    600: '#0E8A80',
    700: '#0B6D65',
    800: '#08504A',
    900: '#053330',
  },
  aqua: {
    DEFAULT: '#00C8E6',
    50: '#E6F9FC',
    100: '#C0F0F8',
    200: '#81E1F1',
    300: '#42D2EA',
    400: '#13C8E6',
    500: '#00C8E6',
    600: '#00A0B8',
    700: '#00788A',
    800: '#00505C',
    900: '#00282E',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const semanticColors = {
  success: {
    DEFAULT: '#11A79B',
    light: '#E6F7F6',
    dark: '#0B6D65',
  },
  warning: {
    DEFAULT: '#EAB308',
    light: '#FEF9C3',
    dark: '#854D0E',
  },
  error: {
    DEFAULT: '#EF4444',
    light: '#FEF2F2',
    dark: '#B91C1C',
  },
  info: {
    DEFAULT: '#3B82F6',
    light: '#EFF6FF',
    dark: '#1E40AF',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: '1.2',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

export const spacing = {
  0: '0px',
  px: '1px',
  '0.5': '2px',
  1: '4px',
  '1.5': '6px',
  2: '8px',
  '2.5': '10px',
  3: '12px',
  '3.5': '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const;

export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const;

export const shadows = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 50,
  sticky: 100,
  overlay: 200,
  modal: 300,
  popover: 400,
  toast: 500,
  tooltip: 600,
} as const;

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

export const buttonTokens = {
  height: {
    sm: '32px',
    md: '40px',
    lg: '48px',
  },
  padding: {
    sm: '12px',
    md: '16px',
    lg: '32px',
  },
  fontSize: {
    sm: '12px',
    md: '14px',
    lg: '16px',
  },
} as const;

export const inputTokens = {
  height: '40px',
  padding: '12px',
  fontSize: '14px',
  borderRadius: '8px',
} as const;

export const cardTokens = {
  padding: '24px',
  borderRadius: '12px',
  borderWidth: '1px',
} as const;

export const modalTokens = {
  maxWidth: '480px',
  maxWidthLg: '640px',
  padding: '24px',
  borderRadius: '16px',
  overlayBg: 'rgba(0, 0, 0, 0.5)',
} as const;

export const toastTokens = {
  width: '360px',
  positionBottom: '24px',
  positionRight: '24px',
  duration: 5000,
} as const;

export const designTokens = {
  colors,
  semanticColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  button: buttonTokens,
  input: inputTokens,
  card: cardTokens,
  modal: modalTokens,
  toast: toastTokens,
} as const;

export type DesignTokens = typeof designTokens;
export type Colors = typeof colors;
export type SemanticColors = typeof semanticColors;
