import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Body, Label, Title } from '@/components/ui';
import { colors, space } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={styles.container}>
        <Label>File missing</Label>
        <Title>This page is not in the archive.</Title>
        <Link href="/" style={styles.link}>
          <Body style={styles.linkText}>Back to Listen</Body>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg,
    gap: space.sm,
    backgroundColor: colors.background,
  },
  link: { marginTop: space.md, paddingVertical: space.md },
  linkText: { color: colors.amber },
});
