import type { Meta, StoryObj } from '@storybook/react-vite';
import { OnboardingProgress } from './OnboardingProgress';

/**
 * `Pharos/App/Onboarding progress` `2062:410` — five variants, one per onboarding step.
 * Every one of the 13 instances is 370x4.
 */
const meta = { title: 'Components/OnboardingProgress', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

/** 2062:405 · segment 1 #225d74, segments 2–5 #d7e0e6 */
export const Filled1: Story = { render: () => <OnboardingProgress filled={1} /> };

/** 2062:406 · segments 1–2 #225d74 */
export const Filled2: Story = { render: () => <OnboardingProgress filled={2} /> };

/** 2062:407 · segments 1–3 #225d74 */
export const Filled3: Story = { render: () => <OnboardingProgress filled={3} /> };

/** 2062:408 · segments 1–4 #225d74 */
export const Filled4: Story = { render: () => <OnboardingProgress filled={4} /> };

/** 2062:409 · all five #225d74 */
export const Filled5: Story = { render: () => <OnboardingProgress filled={5} /> };
