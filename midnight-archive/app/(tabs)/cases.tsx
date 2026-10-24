import { ComingSoon } from '@/components/ui';

export default function CasesScreen() {
  return (
    <ComingSoon
      label="Case File 000"
      title="The Mary Celeste"
      lines={[
        'A ship found adrift. No crew aboard.',
        'Read the file. Find the clues. Build the key. Break the cipher.',
        'Free to play. No account needed.',
      ]}
      milestone={3}
    />
  );
}
