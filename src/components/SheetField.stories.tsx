import type { Meta, StoryObj } from '@storybook/react-vite';
import { SheetField } from './SheetField';

/**
 * The `Pharos/Input` instances inside `Content=Price` (2197:8777): 354x76 =
 * Label/14 row 20 + gap 8 + 48px control. No icon slot, no hint line.
 */
const meta = { title: 'Components/SheetField', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

/** 2197:8787 · State=Filled, value "380 €" */
export const YourRate: Story = {
  render: () => (
    <div className="w-[354px]">
      <SheetField label="Your rate" value="380 €" />
    </div>
  ),
};

/** 2197:8796 · State=Filled, value "I can take this trip today." */
export const Comment: Story = {
  render: () => (
    <div className="w-[354px]">
      <SheetField label="Comment" value="I can take this trip today." />
    </div>
  ),
};

/** the empty counterpart — not a Figma variant, shown so the placeholder colour is measured */
export const Empty: Story = {
  render: () => (
    <div className="w-[354px]">
      <SheetField label="Your rate" placeholder="Enter your rate" />
    </div>
  ),
};
