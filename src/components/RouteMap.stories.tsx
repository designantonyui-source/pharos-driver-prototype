import type { Meta, StoryObj } from '@storybook/react-vite';
import { RouteMap } from './RouteMap';

/**
 * figma: 330:164 — 6 variants, one story each. Fullscreen: the Desktop variant is 628 wide and would
 * be clipped inside the 402x874 phone decorator.
 */
const meta = {
  title: 'Components/RouteMap',
  component: RouteMap,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RouteMap>;
export default meta;
type Story = StoryObj<typeof RouteMap>;

export const MobileResults: Story = { args: { size: 'mobile', state: 'results' } };

export const MobileSelected: Story = { args: { size: 'mobile', state: 'selected' } };

export const MobileLoading: Story = { args: { size: 'mobile', state: 'loading' } };

export const DesktopResults: Story = { args: { size: 'desktop', state: 'results' } };

export const DesktopSelected: Story = { args: { size: 'desktop', state: 'selected' } };

export const DesktopLoading: Story = { args: { size: 'desktop', state: 'loading' } };
