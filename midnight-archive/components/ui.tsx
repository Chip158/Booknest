import { ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextProps, View, ViewProps } from 'react-native';

import { colors, fonts, radius, space } from '@/constants/theme';

// Small typewriter label, e.g. "CASE FILE 000".
export function Label({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.label, style]} />;
}

export function Headline({ style, ...props }: TextProps) {
  return <Text accessibilityRole="header" {...props} style={[styles.headline, style]} />;
}

export function Title({ style, ...props }: TextProps) {
  return <Text accessibilityRole="header" {...props} style={[styles.title, style]} />;
}

export function Body({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.body, style]} />;
}

export function Panel({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.panel, style]} />;
}

export function Seal({ size = 72 }: { size?: number }) {
  return (
    <Image
      source={require('@/assets/images/seal.png')}
      style={{ width: size, height: size }}
      accessibilityLabel="Midnight Archive seal"
    />
  );
}

// Standard scrolling screen with the archive background.
export function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      {children}
    </ScrollView>
  );
}

// Placeholder used by tabs until their milestone is built.
export function ComingSoon({
  label,
  title,
  lines,
  milestone,
}: {
  label: string;
  title: string;
  lines: string[];
  milestone: number;
}) {
  return (
    <Screen>
      <View style={styles.hero}>
        <Seal />
        <Label style={styles.heroLabel}>{label}</Label>
        <Title style={styles.heroTitle}>{title}</Title>
      </View>
      <Panel>
        {lines.map((line) => (
          <Body key={line} style={styles.line}>
            {line}
          </Body>
        ))}
        <Label style={styles.milestone}>Opens in milestone {milestone}.</Label>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.label,
    color: colors.amber,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: fonts.headline,
    color: colors.text,
    fontSize: 22,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.title,
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
  },
  body: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  panel: {
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: space.md,
  },
  screen: { flex: 1, backgroundColor: colors.background },
  screenContent: { padding: space.md, paddingBottom: space.xl, gap: space.md },
  hero: { alignItems: 'center', paddingVertical: space.lg, gap: space.sm },
  heroLabel: { marginTop: space.sm },
  heroTitle: { textAlign: 'center' },
  line: { marginBottom: space.sm },
  milestone: { marginTop: space.sm, color: colors.textMuted, fontSize: 12 },
});
