import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, ButtonLink } from './Button';

/**
 * Mirrors `Pharos/Button` (12:38): Appearance=Primary/Secondary × Size=Web(40)/Mobile(48) ×
 * State=Default/Hover/Pressed/Focus/Disabled/Loading — plus the prototype-led `danger` appearance.
 * Hover and Pressed are CSS pseudo-classes, so they have no separate story — they are verified
 * against the Figma colours with a real pointer.
 */
const meta = { title: 'Components/Button', component: Button } satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { label: 'Send application' } };

export const Secondary: Story = { args: { label: 'View load details', appearance: 'secondary' } };

export const Disabled: Story = { args: { label: 'Find loads', disabled: true } };

export const SecondaryDisabled: Story = { args: { label: 'Find loads', appearance: 'secondary', disabled: true } };

export const Loading: Story = { args: { label: 'Use my location', loading: true } };

export const SecondaryLoading: Story = { args: { label: 'Use my location', appearance: 'secondary', loading: true } };

export const Focus: Story = { args: { label: 'Send application', focus: true } };

export const SecondaryFocus: Story = { args: { label: 'View load details', appearance: 'secondary', focus: true } };

/**
 * PROTOTYPE-LED: the Figma set has only Primary/Secondary, so these four must go back into it.
 * One destructive secondary — white fill, danger border, danger label, danger-tinted hover.
 */
export const Danger: Story = { args: { label: 'Cancel trip', appearance: 'danger' } };

export const DangerDisabled: Story = { args: { label: 'Cancel trip', appearance: 'danger', disabled: true } };

export const DangerLoading: Story = { args: { label: 'Cancel trip', appearance: 'danger', loading: true } };

export const DangerFocus: Story = { args: { label: 'Cancel trip', appearance: 'danger', focus: true } };

export const WebSize: Story = {
  render: () => (
    <div className="flex flex-col gap-[12px]">
      <Button label="Send application" size="web" />
      <Button label="View load details" appearance="secondary" size="web" />
    </div>
  ),
};

/** `Pharos/Button link` (168:118) — text only, hugs its content, 12 variants. */
export const AsLink: Story = { render: () => <ButtonLink label="Resend code" /> };

export const LinkLoading: Story = { render: () => <ButtonLink label="Resend code" loading /> };

export const LinkDisabled: Story = { render: () => <ButtonLink label="Resend code" disabled /> };

export const LinkFocus: Story = { render: () => <ButtonLink label="Resend code" focus /> };
