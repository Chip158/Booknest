import { ComingSoon } from '@/components/ui';

export default function ListenScreen() {
  return (
    <ComingSoon
      label="The Midnight Archive"
      title="Listen"
      lines={[
        'Every episode of the podcast, in one place.',
        'Full case files, Archive Extras and Shorts.',
        'Play in the background. Save for offline. Pick up where you left off.',
      ]}
      milestone={2}
    />
  );
}
