import { Panel } from '@/components/panel';
import { Screen } from '@/components/screen';

export default function CasesScreen() {
  return (
    <Screen
      label="Case files"
      title="Cases"
      intro="Read the story. Find the clues. Break the cipher.">
      <Panel
        label="Case 000. Free"
        heading="The Mary Celeste"
        text="A ship found drifting, with no one aboard. Open to everyone, no account needed."
      />
    </Screen>
  );
}
