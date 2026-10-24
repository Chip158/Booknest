import { Panel } from '@/components/panel';
import { Screen } from '@/components/screen';

export default function ShopScreen() {
  return (
    <Screen label="Join the Archive" title="Shop" intro="Memberships, merch and gifts.">
      <Panel
        label="Coming next"
        heading="Membership plans"
        text="A sealed case file in your mailbox every month."
      />
      <Panel label="Coming next" heading="Merch and gifts" text="For the archivist in your life." />
    </Screen>
  );
}
