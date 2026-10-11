/** figma: n/a · Toast stories — the single notification pattern (Wave 3 polish) */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Toast, type ToastData } from './Toast';
import { Button } from '../Button';
const meta = {
  title: 'App shell/Toast', component: Toast,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Success: Story = {
  args: { toast: { tone: 'success', title: 'Bank account saved', detail: 'Cash out will offer it right away.' }, onClose: () => {} },
};
export const Interactive: Story = {
  render: () => {
    const [toast, setToast] = useState<ToastData>(null);
    return <div className="relative h-[300px] w-[402px] bg-[var(--color-bg-canvas)]">
      <div className="p-[16px]"><Button label="Show toast" onClick={() => setToast({ tone: 'success', title: 'Rule saved', detail: 'It applies from the next Balance open.' })} /></div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>;
  },
};
