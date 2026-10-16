/**
 * figma: n/a · Dispatcher chat — thread model (screen: src/screens/v2/TripChat.tsx)
 * props: n/a (types + seed; data access stays in src/lib/api.ts)
 * tokens: n/a (no UI)
 *
 * Threads are PER TRIP, not one global inbox: the conversation is about one cargo,
 * which is what makes the entry point cheap ("Contact dispatcher" on the trip) and
 * removes the need to pick a thread. Rate negotiation (`ChatRateOffer`) is a later
 * message type on the same thread, not a second inbox.
 *
 * Prototype: the driver writes, a seeded dispatcher answers, nothing is transmitted.
 */
export type ChatAuthor = 'driver' | 'dispatcher' | 'system';

export type ChatMessage = {
  id: string;
  loadId: string;
  author: ChatAuthor;
  text: string;
  at: string;
};

/** One stable id without pulling in a dependency. */
export function chatId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;
}

/**
 * Opening of a thread so it is never an empty screen on first open. The dispatcher
 * carries the facts the driver cannot get from the app yet (gate, bay, who to call).
 */
export function seedThread(
  loadId: string,
  ctx: { from: string; to: string; gate: string },
): ChatMessage[] {
  const now = Date.now();
  const at = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();
  return [
    { id: `${loadId}-m1`, loadId, author: 'dispatcher', text: `Morning — ${ctx.from} → ${ctx.to} is confirmed on our side. Ping me if the gate is backed up.`, at: at(46) },
    { id: `${loadId}-m2`, loadId, author: 'driver', text: 'Thanks. Leaving now, should reach the gate around 13:40.', at: at(41) },
    { id: `${loadId}-m3`, loadId, author: 'dispatcher', text: `Noted. ${ctx.gate}`, at: at(12) },
  ];
}

export function formatChatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/** "Today · 14:00–15:00 · €360" — the strip above the thread. */
export function threadContextSummary(window: string, rate: number): string {
  return `Today · ${window} · €${rate}  ›`;
}
