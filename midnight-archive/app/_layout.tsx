import { Oswald_400Regular, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { colors } from '@/constants/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Keep the splash screen up until the brand fonts are ready.
SplashScreen.preventAutoHideAsync();

const archiveTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.amber,
    background: colors.background,
    card: colors.panel,
    text: colors.text,
    border: colors.panelBorder,
    notification: colors.seal,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpecialElite_400Regular,
    Oswald_400Regular,
    Oswald_600SemiBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={archiveTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
