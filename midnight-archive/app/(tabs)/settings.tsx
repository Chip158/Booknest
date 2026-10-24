import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';

import { Body, Label, Panel, Screen, Seal, Title } from '@/components/ui';
import { space } from '@/constants/theme';

export default function SettingsScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <Seal size={56} />
        <Title>Settings</Title>
      </View>
      <Panel style={styles.panel}>
        <Label>Alerts</Label>
        <Body>New episodes, ship day and the join deadline. Each one can be turned on or off. Opens in milestone 5.</Body>
      </Panel>
      <Panel style={styles.panel}>
        <Label>Account</Label>
        <Body>Sign in, sign out and account deletion. Opens in milestone 4.</Body>
      </Panel>
      <Panel style={styles.panel}>
        <Label>About</Label>
        <Body>Midnight Archive Mailer. The Archive in your pocket.</Body>
        <Body>Version {Constants.expoConfig?.version ?? '1.0.0'}</Body>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: space.md, gap: space.sm },
  panel: { gap: space.sm },
});
