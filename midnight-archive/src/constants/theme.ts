/**
 * Midnight Archive brand tokens. Every screen pulls colors, fonts and
 * spacing from here so the look stays consistent.
 */

export const Colors = {
  background: '#0b0b0d',
  panel: '#121216',
  line: '#24242b',
  amber: '#e8b04b',
  sealRed: '#7a1015',
  text: '#f2f2f5',
  textMuted: '#c9c9d4',
} as const;

/** Font family names, registered in src/app/_layout.tsx. */
export const Fonts = {
  /** Special Elite: typewriter labels and stamps. */
  label: 'SpecialElite_400Regular',
  /** Oswald: headlines and buttons. */
  headline: 'Oswald_600SemiBold',
  headlineRegular: 'Oswald_400Regular',
  /** Playfair Display: case and episode titles. */
  title: 'PlayfairDisplay_700Bold',
  titleItalic: 'PlayfairDisplay_400Regular_Italic',
} as const;

export const Spacing = {
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 6,
  medium: 12,
} as const;
