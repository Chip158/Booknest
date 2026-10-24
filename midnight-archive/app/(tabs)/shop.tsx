import { ComingSoon } from '@/components/ui';

export default function ShopScreen() {
  return (
    <ComingSoon
      label="Join the Archive"
      title="Shop"
      lines={[
        'Membership plans, merch and gifts.',
        'Everything opens on midnightarchivemailer.com.',
      ]}
      milestone={5}
    />
  );
}
