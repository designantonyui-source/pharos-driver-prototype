import type { ReactNode } from 'react';
import { Icon } from './Icon';

/**
 * figma: 2013:3064 · Pharos/App/Upload field — State=Empty `2013:3060` · State=Chosen `2013:3061` ·
 *        State=Rejected `2013:3062` · State=Uploading `2013:3063`. All four are 370x180; the only
 *        two instances on a driver page (2014:2459, 2087:3492) are State=Empty.
 * props: state, title, description, removeLabel, preview, previewTone,
 *        onCapture, onReplace, onRemove
 *
 *   Empty   370x180, r12 (radius/md), fill #ffffff and a **1.5px DASHED #8093a0** border, pad 24,
 *           VERTICAL gap 12, centred. Content box 370-3-48 = 319 wide (Figma 319).
 *     `Lucide/Icon/Camera` 32x32 #172a35
 *     "Photograph your document"   DM Sans Medium 14/20 (Label/14) #172a35, textAlign CENTER
 *     "Show all edges and keep the text clear"  DM Sans Regular 12/16 (Caption/12) #172a35
 *       — the caption really is color/text/primary in Figma, not secondary
 *     content 32+12+20+12+16 = 92, centred in the 180 → first child at y 44 (Figma 44)
 *   Chosen / Uploading  1px #8093a0 border, fill #ffffff; Rejected 1.5px #b8332f border,
 *           fill #fdedea (color/status/danger-bg)
 *     Preview 368x112 (367x112 in Rejected — the thicker stroke takes the extra pixel):
 *       Chosen/Uploading/Rejected: fill #ffffff + `Lucide/Icon/Image` 32x32 #172a35 centred
 *       [`Pharos/Upload field/Driving licence preview`] replaces this slot with the licence sample
 *        art on a #eff2f5 fill — that is what `preview` / `previewTone` exist for; see
 *        DrivingLicencePreview.tsx
 *     Actions 368x66 (367x65 in Rejected), HORIZONTAL pad 12/16, gap 12, MIN/CENTER
 *       Text column 304x38, VERTICAL gap 2: "Document photo" DM Sans Medium 14/20 #172a35 +
 *         "Tap the photo to replace it" DM Sans Regular 12/16 #172a35
 *         (Uploading: the second line is "Sending…"; Rejected swaps it for a 16-tall row:
 *          `Lucide/Icon/Triangle Alert` 16x16 #225d74 + gap 4 + the reason in 12/16 #b8332f)
 *       Remove `Lucide/Icon/Circle X` 20x20 #225d74 — hidden in State=Uploading
 *
 *   Composition note: `DrivingLicencePreview` (2091:441) is this box with a different Preview
 *   slot, so it is built ON TOP of this component rather than beside it.
 *
 * The 1.5px strokes are drawn as an SVG stroke, not a CSS border: Chrome floors a specified
 *   1.5px border width to 1px (`getComputedStyle` reports 1px, verified at dpr 1 and 2), which
 *   would also shift the content box by 0.5px per side and lose Figma's 6/6 dash pattern. The
 *   outline SVG uses the Figma viewBox (370x180), so at the card width the stroke is exactly
 *   1.5px with `stroke-dasharray: 6 6`; at another width the stroke would scale (`w-full` is kept
 *   for reuse, but every use in this design is the 370 card). The same trick is not needed for
 *   the 1px Chosen/Uploading border, which CSS renders exactly.
 *   The outline is painted AFTER the content: the State=Empty button is positioned, so a sibling
 *   placed before it would be covered by the button's white fill (measured: no border at all).
 *   Dash PHASE is the one thing that cannot match: Figma restarts the dash pattern at every edge
 *   (its runs begin at x/y 10, 21, 33 … on all four sides) while an SVG rounded-rect stroke runs
 *   the pattern continuously around the loop. Measured phase offset vs Figma on the 370x180 card:
 *   top +3px, bottom +4px, left −2px, right 0px — dash length, gap, colour, thickness and radius
 *   all match exactly.
 *
 * Known deviation, not fixed: Figma draws the remove action as a bare 20x20 target, below the
 *   48px touch minimum the icons page asks for. It is kept at 20x20 for 1:1 geometry and carries
 *   an accessible name; the hit area needs a design decision.
 *
 * tokens: color-bg-surface, color-bg-subtle, color-border-strong, color-border-danger,
 *         color-status-danger-bg, color-text-primary, color-text-danger, color-action-text,
 *         radius-md, size-icon-sm, size-icon-lg, text-label-14, text-caption-12
 * TODO(token): the dashed 1.5px stroke, its 6/6 pattern and the 32px icon have no token
 *   (size-icon stops at 24); the 32 value is the Figma number, inlined as elsewhere.
 */
export type UploadFieldState = 'empty' | 'chosen' | 'rejected' | 'uploading';

const DEFAULTS: Record<UploadFieldState, { title: string; description: string }> = {
  empty: { title: 'Photograph your document', description: 'Show all edges and keep the text clear' },
  chosen: { title: 'Document photo', description: 'Tap the photo to replace it' },
  rejected: { title: 'Document photo', description: 'Photo unreadable · take another' },
  uploading: { title: 'Document photo', description: 'Sending…' },
};

/** The 1.5px INSIDE stroke of State=Empty (dashed 6/6) and State=Rejected — see the note above.
 *  The colour arrives as a CSS variable through `style`, not a Tailwind class: v4 cannot tell an
 *  arbitrary `stroke-[…]` colour from a stroke-WIDTH and emits `stroke-width: …`, which is invalid
 *  at computed-value time and leaves the rect unstroked (measured: an invisible border). */
function CardOutline({ stroke, dashed = false }: { stroke: string; dashed?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 370 180"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <rect
        x="0.75"
        y="0.75"
        width="368.5"
        height="178.5"
        rx="11.25"
        fill="none"
        strokeWidth="1.5"
        strokeDasharray={dashed ? '6 6' : undefined}
        style={{ stroke }}
      />
    </svg>
  );
}

export function UploadField({
  state = 'empty',
  title,
  description,
  removeLabel = 'Remove photo',
  preview,
  previewTone = 'surface',
  onCapture,
  onReplace,
  onRemove,
}: {
  state?: UploadFieldState;
  title?: string;
  description?: string;
  /** accessible name of the 20x20 `Circle X` action */
  removeLabel?: string;
  /** the Preview slot; defaults to the 32x32 `Lucide/Icon/Image` placeholder */
  preview?: ReactNode;
  /** Preview fill — `surface` #ffffff (the upload field) or `canvas` #eff2f5 (licence preview) */
  previewTone?: 'surface' | 'canvas';
  onCapture?: () => void;
  onReplace?: () => void;
  onRemove?: () => void;
}) {
  const copy = DEFAULTS[state];
  const fieldTitle = title ?? copy.title;
  const fieldText = description ?? copy.description;
  const rejected = state === 'rejected';

  const previewArea = (
    <button
      type="button"
      aria-label={fieldTitle}
      onClick={onReplace}
      className={`flex h-[112px] w-full shrink-0 items-center justify-center text-left ${
        previewTone === 'canvas' ? 'bg-[var(--color-bg-subtle)]' : 'bg-[var(--color-bg-surface)]'
      }`}
    >
      {preview ?? <Icon name="image" size="xl" className="text-[var(--color-text-primary)]" />}
    </button>
  );

  const actions = (
    <div className="flex flex-1 items-center gap-[12px] px-[16px] py-[12px]">
      <span className="flex w-full flex-col gap-[2px]">
        <span className="text-label-14 text-[var(--color-text-primary)]">{fieldTitle}</span>
        {rejected ? (
          <span className="flex h-[16px] w-full items-center gap-[4px]">
            <Icon name="triangle-alert" size="sm" className="text-[var(--color-action-text)]" />
            <span className="text-caption-12 text-[var(--color-text-danger)]">{fieldText}</span>
          </span>
        ) : (
          <span className="text-caption-12 text-[var(--color-text-primary)]">{fieldText}</span>
        )}
      </span>

      {state !== 'uploading' && (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          className="flex h-[20px] w-[20px] shrink-0 items-center justify-center text-[var(--color-action-text)]"
        >
          <Icon name="circle-x" />
        </button>
      )}
    </div>
  );

  if (state === 'empty') {
    return (
      <div className="relative h-[180px] w-full">
        <button
          type="button"
          onClick={onCapture}
          className="relative flex h-full w-full flex-col items-center justify-center gap-[12px] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] p-[25.5px] text-center"
        >
          <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center text-[var(--color-text-primary)]">
            <Icon name="camera" size="xl" />
          </span>
          <span className="w-full text-label-14 text-[var(--color-text-primary)]">{fieldTitle}</span>
          <span className="w-full text-caption-12 text-[var(--color-text-primary)]">{fieldText}</span>
        </button>
        {/* painted last: the button above is positioned, so a sibling before it would be covered */}
        <CardOutline stroke="var(--color-border-strong)" dashed />
      </div>
    );
  }

  if (rejected) {
    return (
      <div className="relative h-[180px] w-full">
        <div className="flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-status-danger-bg)] p-[1.5px]">
          {previewArea}
          {actions}
        </div>
        <CardOutline stroke="var(--color-border-danger)" />
      </div>
    );
  }

  return (
    <div className="flex h-[180px] w-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)]">
      {previewArea}
      {actions}
    </div>
  );
}
