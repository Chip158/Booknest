import { Panel } from '@/components/panel';
import { Screen } from '@/components/screen';

export default function ListenScreen() {
  return (
    <Screen
      label="The Midnight Archive"
      title="Listen"
      intro="Every case, read aloud after dark. Pull up a chair.">
      <Panel
        label="Coming next"
        heading="Episodes"
        text="Full case episodes and Archive Extras, with a real player. Background play, lock screen controls, speed and downloads."
      />
      <Panel
        label="Coming next"
        heading="Video and Shorts"
        text="The YouTube versions of each episode, plus the latest Shorts."
      />
    </Screen>
  );
}
