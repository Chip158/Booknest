// Midnight Archive brand tokens. Keep every color and font in the app coming from here.
export const colors = {
  background: '#0b0b0d',
  panel: '#121216',
  panelBorder: '#24242b',
  amber: '#e8b04b',
  seal: '#7a1015',
  text: '#f2f2f5',
  textMuted: '#c9c9d4',
} as const;

// Font family names as registered in app/_layout.tsx.
export const fonts = {
  label: 'SpecialElite_400Regular', // typewriter labels
  headline: 'Oswald_600SemiBold', // headlines
  headlineLight: 'Oswald_400Regular',
  title: 'PlayfairDisplay_700Bold', // titles
  body: 'PlayfairDisplay_400Regular',
} as const;

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 6, md: 12 } as const;
