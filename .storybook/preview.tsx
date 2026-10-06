import type { Preview } from '@storybook/react-vite';
import '../src/styles/globals.css';

/**
 * Every component story is rendered inside the real screen context:
 * 402 x 874 with the 16px page padding from the design. Without it `w-full`
 * components have no parent width and look nothing like the Figma frames.
 */
const withScreen = (Story: () => JSX.Element, context: { parameters?: { layout?: string } }) => {
  if (context.parameters?.layout === 'fullscreen') return <Story />;
  return (
    <div
      style={{
        width: 'var(--screen-w)',
        height: 'var(--screen-h)',
        boxSizing: 'border-box',
        padding: 'var(--card-pad)',
        background: 'var(--color-bg-canvas)',
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withScreen],
  parameters: {
    layout: 'centered',
    viewport: { viewports: { screen: { name: 'iPhone 402 × 874', styles: { width: '402px', height: '874px' } } } },
  },
};
export default preview;
