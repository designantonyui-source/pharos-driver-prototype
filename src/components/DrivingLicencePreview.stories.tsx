import type { Meta, StoryObj } from '@storybook/react-vite';
import { DrivingLicencePreview } from './DrivingLicencePreview';

/**
 * `Pharos/Upload field/Driving licence preview` (2091:441) is a single 370x180 component, built
 * here on top of `UploadField` State=Chosen with the licence sample in the Preview slot.
 */
const meta = { title: 'Components/DrivingLicencePreview', component: DrivingLicencePreview } satisfies Meta<
  typeof DrivingLicencePreview
>;
export default meta;
type Story = StoryObj<typeof DrivingLicencePreview>;

/** 2014:2470 / 2092:5966 — both instances override the Actions title to "Driving licence". */
export const Default: Story = { args: {} };

/** The component's own `Document photo` copy, before the instances override it. */
export const DocumentPhoto: Story = { args: { title: 'Document photo' } };
