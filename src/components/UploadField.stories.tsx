import type { Meta, StoryObj } from '@storybook/react-vite';
import { UploadField } from './UploadField';

/**
 * One story per Figma variant of `Pharos/App/Upload field` (2013:3064): State=Empty `2013:3060`,
 * State=Chosen `2013:3061`, State=Rejected `2013:3062`, State=Uploading `2013:3063` — each
 * 370x180. Only State=Empty is instanced on a driver page.
 */
const meta = { title: 'Components/UploadField', component: UploadField } satisfies Meta<typeof UploadField>;
export default meta;
type Story = StoryObj<typeof UploadField>;

/** 2013:3060 · camera 32 + 1.5px dashed #8093a0 border. */
export const Empty: Story = { args: { state: 'empty' } };

/** 2013:3061 · the Image placeholder in a white 368x112 preview. */
export const Chosen: Story = { args: { state: 'chosen' } };

/** 2013:3062 · 1.5px #b8332f border on #fdedea, the second line becomes the danger reason row. */
export const Rejected: Story = { args: { state: 'rejected' } };

/** 2013:3063 · the Loader placeholder, "Sending…" and the remove action hidden. */
export const Uploading: Story = { args: { state: 'uploading' } };
