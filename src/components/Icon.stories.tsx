import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, ICONS, type IconName } from './Icon';

/**
 * figma: 03 — Icons (page `9:5`) — the same set, so the sheet can be diffed against the Figma page.
 * One story per size the tokens cover, plus the full sheet at 24 px.
 */
const meta = { title: 'Foundations/Icons', component: Icon, parameters: { layout: 'centered' } } satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof Icon>;

const NAMES = Object.keys(ICONS) as IconName[];

export const Sheet: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-x-[8px] gap-y-[20px] bg-[var(--color-bg-surface)] p-[24px]">
      {NAMES.map((name) => (
        <div key={name} className="flex w-[104px] flex-col items-center gap-[8px] text-[var(--color-text-primary)]">
          <Icon name={name} size="lg" />
          <span className="text-caption-12 text-center break-words text-[var(--color-text-secondary)]">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-[24px] bg-[var(--color-bg-surface)] p-[24px] text-[var(--color-text-primary)]">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-[8px]">
          <Icon name="truck" size={size} />
          <span className="text-caption-12 text-[var(--color-text-secondary)]">
            {size} · {size === 'sm' ? 16 : size === 'md' ? 20 : 24}
          </span>
        </div>
      ))}
      <div className="flex flex-col items-center gap-[8px]">
        <Icon name="truck" size={14} />
        <span className="text-caption-12 text-[var(--color-text-secondary)]">14 — no token</span>
      </div>
    </div>
  ),
};

/** Colour always comes from the parent, so an icon inside a status pill or a button just works. */
export const InheritsColour: Story = {
  render: () => (
    <div className="flex flex-col gap-[12px] bg-[var(--color-bg-surface)] p-[24px]">
      <span className="text-[var(--color-text-primary)]">
        <Icon name="package" /> primary
      </span>
      <span className="text-[var(--color-action-primary)]">
        <Icon name="map-pin" /> action
      </span>
      <span className="text-[var(--color-status-danger-text)]">
        <Icon name="triangle-alert" /> danger
      </span>
    </div>
  ),
};
