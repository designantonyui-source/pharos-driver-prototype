/**
 * figma: prototype-led · TripChat — dispatcher thread for one trip; route /trip/:id/chat
 * props: route id (screen) · thread from src/lib/api.ts
 * tokens: color-bg-canvas, color-bg-surface, color-border-default, color-text-*,
 *         nav-bar-back-h, tab-bar-h, home-indicator-h, spacing-*, radius-*
 *
 * Closes DRIVER-FLOWS F4 ("chat components exist, no screen"). Composed entirely from
 * measured components — MessageBubble `skin="plain"` (the shape the iOS app actually
 * ships, 294 wide), ChatComposer (2188:7944) and ChatCargoContext (2188:8055).
 * No bespoke chat chrome.
 *
 * Threads are per trip. The context strip at the top always states which cargo is
 * being discussed, so the flow never needs a thread picker.
 */
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatCargoContext } from '../../components/ChatCargoContext';
import { ChatComposer } from '../../components/ChatComposer';
import { MessageBubble } from '../../components/MessageBubble';
import { V2BackBar } from '../../components/layout/NavigationBar';
import { V2Frame } from '../../components/v2/V2Frame';
import { getLoad, getThread, sendMessage } from '../../lib/api';
import { formatChatTime, threadContextSummary, type ChatMessage } from '../../lib/chat';

export function TripChat() {
  const { id = '' } = useParams();
  const [thread, setThread] = useState<ChatMessage[] | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const load = getLoad(id);

  useEffect(() => {
    let live = true;
    getThread(id)
      .then((t) => { if (live) setThread(t); })
      .catch(() => { if (live) setError('Could not load the conversation.'); });
    return () => { live = false; };
  }, [id]);

  // Follow the newest message, including the one the driver just sent.
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [thread]);

  async function submit() {
    if (sending || !draft.trim()) return;
    setSending(true);
    setError(null);
    try {
      await sendMessage(id, draft);
      setDraft('');
      setThread(await getThread(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the message.');
    } finally { setSending(false); }
  }

  return (
    <V2Frame active="Trips">
      <div className="absolute inset-x-0 top-0 bottom-[117px] z-10 flex flex-col">
        <V2BackBar title="Dispatcher" fallback={`/trip/${id}`} />
        <div className="flex min-h-0 flex-1 flex-col gap-[12px] overflow-y-auto bg-[var(--color-bg-canvas)] px-[16px] pb-[12px] pt-[12px] [&>*]:shrink-0">
          <h1 className="sr-only">Dispatcher chat</h1>
          {load && (
            <ChatCargoContext
              route={`${load.from} → ${load.to}`}
              summary={threadContextSummary(load.window, load.rate)}
            />
          )}
          {thread === null ? (
            <p role="status" className="text-body-14 text-[var(--color-text-secondary)]">Loading conversation…</p>
          ) : (
            <div className="flex flex-col gap-[8px]">
              {thread.map((m) => m.author === 'system' ? (
                <p key={m.id} className="my-[4px] text-center text-caption-12 text-[var(--color-text-secondary)]">{m.text}</p>
              ) : (
                <MessageBubble
                  key={m.id}
                  skin="plain"
                  sender={null}
                  direction={m.author === 'driver' ? 'outgoing' : 'incoming'}
                  message={m.text}
                  time={formatChatTime(m.at)}
                />
              ))}
              <div ref={endRef} />
            </div>
          )}
          {error && <p role="alert" className="text-body-14 text-[var(--color-text-danger)]">{error}</p>}
        </div>
        <div className="shrink-0 border-t border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-[16px] pb-[12px] pt-[8px]">
          <ChatComposer
            state={draft.trim() ? 'draft' : 'empty'}
            value={draft}
            placeholder="Message your dispatcher…"
            sendLabel={sending ? 'Sending…' : 'Send'}
            onChange={setDraft}
            onSend={() => { void submit(); }}
          />
        </div>
      </div>
    </V2Frame>
  );
}
