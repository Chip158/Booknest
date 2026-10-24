import { Panel } from '@/components/panel';
import { Screen } from '@/components/screen';

export default function VaultScreen() {
  return (
    <Screen
      label="Members only"
      title="The Vault"
      intro="Sign in to open the cases you have unlocked.">
      <Panel
        label="Coming next"
        heading="Your case files"
        text="Stories, Field Kits, PDFs and episodes for every case you own. Progress saves as you go."
      />
      <Panel
        label="Coming next"
        heading="Season progress"
        text="Every fragment word you have earned this season, in one place."
      />
    </Screen>
  );
}
