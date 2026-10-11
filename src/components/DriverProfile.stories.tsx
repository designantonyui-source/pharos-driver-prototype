import type { Meta, StoryObj } from '@storybook/react-vite';
import { DriverProfile } from './DriverProfile';

/**
 * `Pharos/App/Driver profile` `769:10428` — one Figma variant, `Density=Compact` (`769:10413`).
 * `Compact` is the component as the nine instances draw it (`Show verification=false`, 370x82);
 * `SetVariant` is the component set's own state (`Show verification=true`, 370x100).
 */
const meta = { title: 'Components/DriverProfile', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

/** 2081:5764 (and the other eight instances) · 370x82 · verification row hidden */
export const Compact: Story = {
  render: () => <DriverProfile />,
};

/** 769:10413 · 370x100 · the verification row ("Verified", #216547) is visible in the set */
export const SetVariant: Story = {
  render: () => <DriverProfile verified />,
};

/** Compact polish — verification appended to the body line, card stays 82 tall */
export const VerifiedInline: Story = {
  render: () => <DriverProfile verified verifiedStyle="inline" />,
};

/** Figma boolean `Show country flag` = true, instance swap `Country flag` = France (249:1647) */
export const WithCountryFlag: Story = {
  render: () => <DriverProfile verified country="France" />,
};
