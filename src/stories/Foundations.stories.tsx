import type { Meta, StoryObj } from '@storybook/react-vite';
import tokens from '../../design/tokens.json';

/** Design tokens exported from Figma (design/tokens.json). Never hardcode these values. */
const meta = { title: 'Foundations/Tokens', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const Swatch = ({ name, value }: { name: string; value: string }) => (
  <div className="flex items-center gap-3">
    <span className="h-8 w-8 shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-border-default)]" style={{ background: value }} />
    <span className="w-[220px] text-label-12 text-[var(--color-text-secondary)]">{name}</span>
    <code className="text-caption-12 text-[var(--color-text-tertiary)]">{value}</code>
  </div>
);

export const Colors: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-x-8 gap-y-3 bg-[var(--color-bg-canvas)] p-8">
      {Object.entries(tokens).filter(([g]) => g.startsWith('color-')).flatMap(([group, values]) =>
        Object.entries(values as Record<string, string>).map(([name, value]) => (
          <Swatch key={`${group}-${name}`} name={`${group}/${name}`} value={value} />
        )),
      )}
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className="space-y-4 bg-[var(--color-bg-canvas)] p-8">
      {Object.entries(tokens.text).map(([name, t]) => (
        <div key={name} className="flex items-baseline gap-4">
          <code className="w-[140px] text-caption-12 text-[var(--color-text-tertiary)]">text-{name}</code>
          <span style={{ fontSize: t.size, lineHeight: t.line, fontWeight: Number(t.weight), fontFamily: `var(--font-${t.family === 'heading' ? 'heading' : 'ui'})` }}>
            Loads on your route €360
          </span>
        </div>
      ))}
    </div>
  ),
};

export const SpacingAndRadius: Story = {
  render: () => (
    <div className="space-y-6 bg-[var(--color-bg-canvas)] p-8">
      <div className="flex items-end gap-3">
        {Object.entries(tokens.spacing).map(([name, value]) => (
          <div key={name} className="text-center">
            <div className="bg-[var(--color-action-primary)]" style={{ width: value, height: value }} />
            <code className="text-caption-12 text-[var(--color-text-tertiary)]">{name}</code>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-4">
        {Object.entries(tokens.radius).map(([name, value]) => (
          <div key={name} className="text-center">
            <div className="h-16 w-16 border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]" style={{ borderRadius: value }} />
            <code className="text-caption-12 text-[var(--color-text-tertiary)]">{name}</code>
          </div>
        ))}
      </div>
    </div>
  ),
};
