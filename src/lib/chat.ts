/**
 * figma: n/a · Dispatcher chat — thread model (screen: src/screens/v2/TripChat.tsx)
 * props: n/a (types + seed; data access stays in src/lib/api.ts)
 * tokens: n/a (no UI)
 *
 * Threads are PER TRIP, not one global inbox: the conversation is about one cargo,
 * which is what makes the entry point cheap ("Message dispatcher" on the trip) and
 * removes the need to pick a thread. Rate negotiation (`ChatRateOffer`) is a later
 * message type on the same thread, not a second inbox.
 *
 * Prototype: the driver writes; a deterministic "AI dispatcher" mock replies in-context
 * (no LLM), and consequential topics are handed to a human. Nothing is transmitted.
 */
export type ChatAuthor = 'driver' | 'dispatcher' | 'system';

export type ChatMessage = {
  id: string;
  loadId: string;
  author: ChatAuthor;
  text: string;
  at: string;
  /** Set on dispatcher replies drafted by the AI assistant — rendered as "AI dispatcher". */
  automated?: boolean;
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

/**
 * Deterministic "AI dispatcher" brain (prototype: no LLM).
 * It answers routine questions with the load's facts, and hands the thread to a
 * human for the topics an assistant must not resolve on its own:
 *   - money (the AI drafts, never approves an amount — Convoy: the broker approves)
 *   - detention/compensation (the structured claim is logged, the figure is human)
 *   - cancellation (consequential for the reliability score)
 * Production: a real LLM replaces this function; the reply shape and the
 * escalate/handoff rule stay the same.
 */
export type AiDispatcherContext = {
  from: string;
  to: string;
  gate: string;
  window: string;
};

export type AiDispatcherReply = {
  text: string;
  /** true → the AI cannot resolve this itself; a human dispatcher is handed the thread. */
  escalate: boolean;
};

export function aiDispatcherReply(ctx: AiDispatcherContext, message: string): AiDispatcherReply {
  const t = message.toLowerCase();
  const has = (...words: string[]) => words.some((w) => t.includes(w));

  // Detention / waiting is checked BEFORE money: "detention pay" is the specific
  // intent (a logged claim), while "pay" alone is the generic one.
  if (has('detention', 'held', 'hold', 'waiting', 'standstill')) {
    return {
      text: 'Waiting time is logged from when you marked arrived. I’ve started a detention note — a dispatcher will confirm the compensation.',
      escalate: true,
    };
  }
  // Money-adjacent topics stay with a person.
  if (has('pay', 'paid', 'earnings', 'earn', 'rate', 'amount', 'compensation', 'money', 'fee', 'payout')) {
    return {
      text: 'That affects your earnings, which needs a person to confirm. I’ve handed this to a dispatcher — they’ll reply shortly.',
      escalate: true,
    };
  }
  if (has('cancel', 'falloff', 'drop the load', 'unassign', 'remove')) {
    return {
      text: 'Cancelling a confirmed trip affects your reliability score. I’ve asked a dispatcher to walk you through the options.',
      escalate: true,
    };
  }
  if (has('delay', 'late', 'traffic', 'queue', 'backed')) {
    return {
      text: `Sorry about that. Tap “Report a delay” on the trip screen so the consignee is notified and your ETA updates. ${ctx.gate}`,
      escalate: false,
    };
  }
  if (has('document', 'pod', 'bol', 'cmr', 'invoice', 'paperwork', 'sign')) {
    return {
      text: 'Your documents are in the Documents tab — the CMR is prefilled and needs a signature at pickup. The POD is required before payout.',
      escalate: false,
    };
  }
  if (has('gate', 'bay', 'reception', 'where', 'pickup', 'address', 'number', 'arrive')) {
    return {
      text: `You’re booked ${ctx.from} → ${ctx.to}, ${ctx.window}. ${ctx.gate}. Your pickup number appears once you mark “Arrived at pickup”.`,
      escalate: false,
    };
  }
  return {
    text: 'Got it. I’m the automated dispatcher — ask about the gate, your documents, or a delay. A human is on standby if I can’t resolve this.',
    escalate: false,
  };
}
