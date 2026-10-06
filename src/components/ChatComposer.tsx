import { Button } from './Button';
import { Input, type InputState } from './Input';

/**
 * figma: 2188:7944 · Pharos/Chat/Composer — State=Empty `2188:7863` · State=Draft `2188:7896`
 *        · State=Disabled `2188:7913` (each 370x48)
 * props: state, value, placeholder, sendLabel, onChange, onSend
 * tokens: (nothing of its own — the row is the gap and the two instances)
 *         spacing-8, radius-sm, control-h, color-action-disabled, color-action-text-disabled,
 *         color-bg-subtle, color-text-primary, color-text-secondary, text-label-14
 *
 *   box HORIZONTAL, no padding, gap 8, counterAxis CENTER, primaryAxis MIN
 *   slot 1  `Pharos/Input` instance 246x48 (`layoutSizingHorizontal = FILL`).
 *           The instance deletes `Label row` from all three variants — control only, no icon:
 *           Empty     control fill color/bg/surface, placeholder "Message…" color/text/secondary
 *           Draft     control fill color/bg/surface, value       color/text/primary
 *           Disabled  control fill color/bg/subtle `#eff2f5`, placeholder "Message…" color/text/secondary
 *   slot 2  `Pharos/Button` instance 116x48 (FIXED — the set master `12:38` is FIXED 200, so 116 is
 *           an instance override), pad 0/16, r8, label "Send" centred. Only Draft can be sent:
 *           Empty     main `12:24` Appearance=Primary, Size=Mobile, State=Disabled
 *                     → fill `#c3d0d8`, label `#80929e`
 *           Draft     main `12:20` Appearance=Primary, Size=Mobile, State=Default
 *                     → fill `#225d74`, label `#ffffff`
 *           Disabled  main `12:24` (the same master as Empty)
 *   horizontal check: 246 + 8 + 116 = 370 == Figma
 *
 * `Input` gained `label = null` for this (it hides the 20px label row) — see Input.tsx.
 * TODO(token): the 116px Send width and the 246px input width are Figma instance numbers, not
 *   tokens. 116 is kept as a literal so the two slots land exactly where Figma draws them; the
 *   input takes the remaining space (`flex-1`), which is what FILL means in Figma.
 *
 * NOTE — the input has no visible label, so its accessible name comes from the placeholder.
 */
export type ComposerState = 'empty' | 'draft' | 'disabled';

/** Figma states map 1:1 onto `Pharos/Input` states. */
const INPUT: Record<ComposerState, InputState> = {
  empty: 'empty',
  draft: 'filled',
  disabled: 'disabled',
};

/** Both Empty and Disabled carry the Button's State=Disabled master; only Draft is sendable. */
const SENDS: Record<ComposerState, boolean> = { empty: false, draft: true, disabled: false };

export function ChatComposer({
  state = 'empty',
  value,
  placeholder = 'Message…',
  sendLabel = 'Send',
  onChange,
  onSend,
}: {
  state?: ComposerState;
  value?: string;
  placeholder?: string;
  sendLabel?: string;
  onChange?: (v: string) => void;
  onSend?: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-[var(--spacing-8)]">
      <div className="min-w-0 flex-1">
        <Input
          label={null}
          icon={false}
          hint={null}
          state={INPUT[state]}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
      </div>
      <div className="w-[116px] shrink-0">
        <Button label={sendLabel} disabled={!SENDS[state]} onClick={onSend} />
      </div>
    </div>
  );
}
