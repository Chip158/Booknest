import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';

import { colors, fonts } from '@/constants/theme';

function TabIcon({ name, color }: { name: SymbolViewProps['name']; color: ColorValue }) {
  return <SymbolView name={name} tintColor={color} size={24} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.amber,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.panel, borderTopColor: colors.panelBorder },
        tabBarLabelStyle: { fontFamily: fonts.label, fontSize: 11 },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.headline, fontSize: 18 },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Listen',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'headphones', android: 'headphones', web: 'headphones' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          title: 'Cases',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'folder', android: 'folder', web: 'folder' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'lock', android: 'lock', web: 'lock' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'gearshape', android: 'settings', web: 'settings' }} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
