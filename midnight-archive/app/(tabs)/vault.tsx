import { ComingSoon } from '@/components/ui';

export default function VaultScreen() {
  return (
    <ComingSoon
      label="Members only"
      title="The Vault"
      lines={[
        'Sign in with the email you use on the website.',
        'Every case you have unlocked waits here. Stories, Field Kits, PDFs and episodes.',
        'Track the fragment words you have earned this season.',
      ]}
      milestone={4}
    />
  );
}
