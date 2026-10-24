import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Label, Title } from '@/components/text';
import { Colors, Spacing } from '@/constants/theme';

type ScreenProps = {
  label: string;
  title: string;
  intro?: string;
  children?: ReactNode;
};

/** Standard tab screen: seal, stamp label, title, intro, then content. */
export function Screen({ label, title, intro, children }: ScreenProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/seal.png')}
            style={styles.seal}
            accessibilityLabel="Midnight Archive seal"
          />
          <Label>{label}</Label>
        </View>
        <Title>{title}</Title>
        {intro ? <Body style={styles.intro}>{intro}</Body> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  seal: {
    width: 36,
    height: 36,
  },
  intro: {
    fontSize: 17,
  },
  body: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
});
