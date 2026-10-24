import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';
import { Oswald_400Regular, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import {
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.amber,
    background: Colors.background,
    card: Colors.panel,
    text: Colors.text,
    border: Colors.line,
    notification: Colors.sealRed,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpecialElite_400Regular,
    Oswald_400Regular,
    Oswald_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
  });

  const ready = fontsLoaded || fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
