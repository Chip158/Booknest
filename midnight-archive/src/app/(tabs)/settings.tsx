import Constants from 'expo-constants';

import { Panel } from '@/components/panel';
import { Screen } from '@/components/screen';

export default function SettingsScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen label="Settings" title="Settings">
      <Panel
        label="Coming next"
        heading="Alerts"
        text="New episodes, ship day on the 15th, and the join deadline. Turn each one on or off."
      />
      <Panel label="Coming next" heading="Account" text="Sign in, sign out and account deletion." />
      <Panel label="About" heading="Midnight Archive" text={`Version ${version}`} />
    </Screen>
  );
}
