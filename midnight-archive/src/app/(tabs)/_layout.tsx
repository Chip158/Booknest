import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

type TabIconProps = {
  name: ComponentProps<typeof Ionicons>['name'];
  color: ColorValue;
  size: number;
};

function TabIcon({ name, color, size }: TabIconProps) {
  // Tint colors come from the theme, which are always hex strings.
  return <Ionicons name={name} color={color as string} size={size} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.amber,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.panel,
          borderTopColor: Colors.line,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.label,
          fontSize: 11,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Listen', tabBarIcon: (p) => <TabIcon name="headset" {...p} /> }}
      />
      <Tabs.Screen
        name="cases"
        options={{ title: 'Cases', tabBarIcon: (p) => <TabIcon name="folder-open" {...p} /> }}
      />
      <Tabs.Screen
        name="vault"
        options={{ title: 'Vault', tabBarIcon: (p) => <TabIcon name="lock-closed" {...p} /> }}
      />
      <Tabs.Screen
        name="shop"
        options={{ title: 'Shop', tabBarIcon: (p) => <TabIcon name="bag-handle" {...p} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: (p) => <TabIcon name="settings-sharp" {...p} /> }}
      />
    </Tabs>
  );
}
