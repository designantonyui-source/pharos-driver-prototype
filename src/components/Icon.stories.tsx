import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, ICONS, type IconName } from './Icon';

/**
 * figma: 03 — Icons (page `9:5`) — the same set, so the sheet can be diffed against the Figma page.
 *
 * Storybook conventions used here:
 * - `layout: 'fullscreen'` — the preview decorator otherwise puts every story inside the 402x874
 *   phone screen, which squeezes and clips a gallery. Foundations and sheets always opt out.
 * - `Controls` are driven by the registry itself (`Object.keys(ICONS)`), so a new icon cannot
 *   be forgotten in the dropdown.
 * - `tags: ['autodocs']` — main.ts sets `docs.autodocs: 'tag'`, so this gives the component a Docs
 *   page with the props table.
 * - no per-icon stories: 24 more entries would bury the sidebar. The gallery plus the `name`
 *   control covers browsing, and `Sheet` is the artefact to review against Figma.
 */
const meta = {
  title: 'Foundations/Icons',
  component: Icon,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    name: { control: 'select', options: Object.keys(ICONS) },
    size: { control: 'select', options: ['sm', 'md', 'lg', 11, 12, 14, 16, 20, 24] },
    label: { control: 'text', description: 'accessible name for an icon-only action' },
    className: { control: 'text', description: 'colour comes from the parent, e.g. text-[var(--color-action-primary)]' },
  },
  args: { name: 'map-pin', size: 'md' },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof Icon>;

/** Pick any icon and size from the Controls panel — it is the same list as the Figma page. */
export const Playground: Story = {
  render: (args) => (
    <div className="flex h-[160px] items-center justify-center gap-[24px] bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)]">
      <Icon {...args} />
    </div>
  ),
};

const NAMES = Object.keys(ICONS) as IconName[];

/** The whole set at 24 px — diff this against Figma's `03 — Icons`. */
export const Sheet: Story = {
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-x-[8px] gap-y-[20px] bg-[var(--color-bg-surface)] p-[24px]">
      {NAMES.map((name) => (
        <div key={name} className="flex flex-col items-center gap-[8px] text-[var(--color-text-primary)]">
          <Icon name={name} size="lg" />
          <span className="break-words text-center text-caption-12 text-[var(--color-text-secondary)]">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-[24px] bg-[var(--color-bg-canvas)] p-[24px] text-[var(--color-text-primary)]">
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
    <div className="flex flex-col gap-[12px] bg-[var(--color-bg-canvas)] p-[24px]">
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

/** Icon-only actions carry an accessible name; without it the glyph is hidden from assistive tech. */
export const AccessibleName: Story = {
  render: () => (
    <div className="flex items-center gap-[16px] bg-[var(--color-bg-canvas)] p-[24px] text-[var(--color-text-primary)]">
      <button
        type="button"
        className="flex h-[48px] w-[48px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-surface)]"
      >
        <Icon name="x" label="Close" />
      </button>
      <span className="text-caption-12 text-[var(--color-text-secondary)]">
        48 px target, per the icon page note
      </span>
    </div>
  ),
};
