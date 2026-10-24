import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

/** Small typewriter label, like a stamp on a case file. */
export function Label({ style, ...rest }: TextProps) {
  return <Text maxFontSizeMultiplier={1.6} style={[styles.label, style]} {...rest} />;
}

/** Bold condensed headline for sections and buttons. */
export function Headline({ style, ...rest }: TextProps) {
  return <Text accessibilityRole="header" style={[styles.headline, style]} {...rest} />;
}

/** Serif title for screens, cases and episodes. */
export function Title({ style, ...rest }: TextProps) {
  return <Text accessibilityRole="header" style={[styles.title, style]} {...rest} />;
}

/** Regular reading text. */
export function Body({ style, ...rest }: TextProps) {
  return <Text style={[styles.body, style]} {...rest} />;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.label,
    fontSize: 13,
    letterSpacing: 1.5,
    color: Colors.amber,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: Fonts.headline,
    fontSize: 20,
    letterSpacing: 0.5,
    color: Colors.text,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Fonts.title,
    fontSize: 34,
    lineHeight: 42,
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textMuted,
  },
});
