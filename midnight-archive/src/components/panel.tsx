import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Body, Headline, Label } from '@/components/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

type PanelProps = {
  label?: string;
  heading: string;
  text?: string;
  children?: ReactNode;
};

/** Dark card with an amber edge, used for sections on every tab. */
export function Panel({ label, heading, text, children }: PanelProps) {
  return (
    <View style={styles.panel}>
      {label ? <Label style={styles.label}>{label}</Label> : null}
      <Headline>{heading}</Headline>
      {text ? <Body>{text}</Body> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: Colors.panel,
    borderColor: Colors.line,
    borderLeftColor: Colors.amber,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: Radius.medium,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  label: {
    fontSize: 11,
  },
});
