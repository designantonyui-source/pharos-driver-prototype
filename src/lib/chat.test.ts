/** figma: n/a · dispatcher thread model; tokens: n/a (no UI) */
import { beforeEach, expect, it, vi } from 'vitest';
import { getThread, reportDelay, sendMessage } from './api';
import { store } from './store';
import { ApplicationStatus } from './models';

beforeEach(() => { localStorage.clear(); store.reset(); vi.restoreAllMocks(); });

it('seeds one thread per trip and appends driver messages to it', async () => {
  const seeded = await getThread('nordcargo');
  expect(seeded.length).toBeGreaterThan(0);
  expect(seeded.every((m) => m.loadId === 'nordcargo')).toBe(true);

  const sent = await sendMessage('nordcargo', 'Gate is backed up');
  expect(sent.author).toBe('driver');
  expect((await getThread('nordcargo')).length).toBe(seeded.length + 1);

  // Threads are per trip: a second trip does not inherit the first conversation.
  const other = await getThread('belroute');
  expect(other.length).toBeGreaterThan(0);
  expect(other.every((m) => m.loadId === 'belroute')).toBe(true);
});

it('refuses an empty message', async () => {
  await expect(sendMessage('nordcargo', '   ')).rejects.toThrow(/Write a message/);
});

it('puts a reported delay into the same thread as a system line', async () => {
  const submittedAt = new Date().toISOString();
  store.set({
    loadId: 'nordcargo',
    status: ApplicationStatus.CONFIRMED,
    submittedAt,
    applications: {
      nordcargo: { loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED, submittedAt, tripId: 'TR-4821', tripStage: 'at-pickup' },
    },
  });
  const before = (await getThread('nordcargo')).length;
  await reportDelay('nordcargo', 15, 'Traffic');
  const after = await getThread('nordcargo');
  expect(after.length).toBe(before + 1);
  expect(after.at(-1)?.author).toBe('system');
  expect(after.at(-1)?.text).toMatch(/15 min delay/i);
});
