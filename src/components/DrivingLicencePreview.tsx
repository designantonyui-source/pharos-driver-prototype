import { Icon } from './Icon';
import { UploadField } from './UploadField';

/**
 * figma: 2091:441 · Pharos/Upload field/Driving licence preview (COMPONENT, 370x180) — no
 *        variants; both instances on page 30 (2014:2470, 2092:5966) are 370x180 and both
 *        override the Actions title "Document photo" → "Driving licence".
 * props: title, description, onReplace, onRemove
 *
 *   This is `Pharos/App/Upload field` State=Chosen with a different Preview slot, so it is built
 *   ON TOP of `UploadField` (which owns the 180-tall box, the 1px #8093a0 border, r12, the
 *   368x66 Actions row, the 20x20 Circle X and the 14/20 + 12/16 type):
 *     Preview fill #eff2f5 (color/bg/subtle) instead of #ffffff      → previewTone="canvas"
 *     Preview content = `Pharos/Preview/Driving licence sample` 192x100, centred
 *       (Figma: x 89 = 1 + (368-192)/2, y 7 = 1 + (112-100)/2)
 *   Box: 1+112+66+1 = 180 · sample: 1+8+12+8+62+8+1 = 100
 *
 *   Licence sample (192x100, r8 radius/sm, pad 8, VERTICAL gap 8, fill #ffffff, 1px #d7e0e6):
 *     "DRIVING LICENCE" DM Sans Medium **10/12** #586d79
 *     row 174x62, HORIZONTAL gap 8
 *       photo box 42x62, r4 (radius/xs), fill #eff2f5, `Lucide/Icon/User Round` 24x24 #225d74
 *       lines 124x62, VERTICAL gap 4 — three 4-tall r2 bars #d7e0e6 (106 / 88 / 98 wide) and
 *         "SAMPLE" DM Sans Medium 10/12 #80929e (color/text/tertiary)
 *
 * Deviation, not fixed: Figma paints both Actions strings **#000000** in this component while the
 *   identical strings in `Pharos/App/Upload field` are #172a35 (color/text/primary). Same style,
 *   same wording, different fill — an unstyled text layer. The design-system value is used here;
 *   re-measure against `getComputedStyle` if the design decides black was intended.
 *
 * tokens: color-bg-subtle, color-bg-surface, color-border-default, color-border-brand,
 *         color-text-secondary, color-text-tertiary, radius-xs, radius-sm, size-icon-lg,
 *         text-label-14, text-body-14, text-caption-12
 * TODO(token): there is NO 10/12 text token (the ramp jumps 12/16 → 14/20). The two 10px strings
 *   use the Figma numbers inline (font-size 10 / line-height 12) with `font-medium`; a
 *   `text-caption-10` token is needed to remove this hardcode.
 * TODO(token): the 4-tall/2-radius skeleton bars and 106/88/98 widths are Figma geometry.
 */
export function DrivingLicencePreview({
  title = 'Driving licence',
  description = 'Tap the photo to replace it',
  onReplace,
  onRemove,
}: {
  title?: string;
  description?: string;
  onReplace?: () => void;
  onRemove?: () => void;
}) {
  return (
    <UploadField
      state="chosen"
      previewTone="canvas"
      preview={<LicenceSample />}
      title={title}
      description={description}
      onReplace={onReplace}
      onRemove={onRemove}
    />
  );
}

/** `Pharos/Preview/Driving licence sample` — the placeholder art in the licence preview. */
function LicenceSample() {
  return (
    <span className="flex h-[100px] w-[192px] flex-col gap-[8px] rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[8px]">
      <span className="text-caption-10 w-full text-[var(--color-text-secondary)]">
        DRIVING LICENCE
      </span>
      <span className="flex h-[62px] w-full gap-[8px]">
        <span className="flex w-[42px] shrink-0 items-center justify-center rounded-[var(--radius-xs)] bg-[var(--color-bg-subtle)] text-[var(--color-border-brand)]">
          <Icon name="user-round" size="lg" />
        </span>
        <span className="flex w-full flex-col gap-[4px]">
          <span className="h-[4px] w-[106px] rounded-[2px] bg-[var(--color-border-default)]" />
          <span className="h-[4px] w-[88px] rounded-[2px] bg-[var(--color-border-default)]" />
          <span className="h-[4px] w-[98px] rounded-[2px] bg-[var(--color-border-default)]" />
          <span className="text-caption-10 w-full text-[var(--color-text-tertiary)]">
            SAMPLE
          </span>
        </span>
      </span>
    </span>
  );
}
