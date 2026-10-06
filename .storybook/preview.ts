import type { Preview } from '@storybook/react-vite';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'canvas', values: [{ name: 'canvas', value: 'var(--color-bg-canvas)' }, { name: 'surface', value: 'var(--color-bg-surface)' }] },
    viewport: { viewports: { screen: { name: 'iPhone 402 × 874', styles: { width: '402px', height: '874px' } } } },
  },
};
export default preview;
