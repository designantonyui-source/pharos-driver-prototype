import { Flag } from './Flag';

/**
 * figma: 769:10428 · Pharos/App/Driver profile — the set has one variant, Density=Compact (769:10413)
 * props: title, keyFact, body, initials, verified, country, density
 *
 *   variant 769:10413 is 370x100 / the nine screen instances are 370x82. The difference is the
 *   `Show verification` boolean: it is TRUE in the set and FALSE in all nine instances
 *   (`2081:5764`, `2081:6576`, `2081:6732`, `2081:5949`, `2081:6890`, `2081:6128`, `2081:6420`,
 *   `2081:6262`, `2081:5649` — all on `06 · Account / Profile · Documents · Vehicle`).
 *   Following trap 16 ("what the screen draws beats what the component set holds") the default here
 *   is `verified={false}` (82 tall) and the set's own state is the `SetVariant` story (100 tall).
 *
 *   box HORIZONTAL gap 12 pad 12, primaryAxis FIXED (370), counterAxis AUTO, radius 12,
 *       fill color/bg/surface, 1px INSIDE stroke color/border/default, counterAxis CENTER
 *       height = 1 + 12 + identity + 12 + 1  ->  82 with the verification row, 100 without
 *   Driver avatar  48x48, radius 999, fill #eff2f5, initials Manrope Bold 24/32 #225d74
 *     — this is its own Figma component `Pharos/App/Driver avatar` (755:366, 56x56 in the library,
 *       instanced at 48x48). It is NOT `Pharos/Avatar` (40x40, DM Sans Medium 14/20), so it is
 *       composed here instead of reusing `Avatar.tsx` (see PORT-LOG §7 on the 44x44 nav-bar avatar).
 *   Driver identity  grows to 284, VERTICAL gap 2:
 *     Title and country  16 tall, HORIZONTAL gap 6, hugging the title text
 *       Title       Manrope SemiBold 12/16 color/text/primary
 *       Country flag `Pharos/Country flag Rectangle` at 16x16 — hidden in the set (Show country flag=false)
 *     Key fact   Manrope SemiBold 14/20 color/text/primary
 *     Body       DM Sans Regular 12/16 color/text/secondary
 *     Verification status  16 tall, radius 999, HORIZONTAL gap 6: 6x6 dot + "Verified"
 *       both color/status/success-text #216547, label DM Sans Medium 12/16
 *
 * tokens: color-bg-surface, color-border-default, color-bg-subtle, color-action-text,
 *         color-text-primary, color-text-secondary, color-status-success-text, radius-md,
 *         radius-pill, spacing-2, spacing-6, spacing-12, spacing-16, spacing-48, card-w,
 *         text-heading-24, text-heading-14, text-heading-12, text-caption-12, text-label-12
 */

/** `Pharos/App/Driver avatar` 755:366 — 48x48 in every instance (the library component is 56x56). */
export function DriverAvatar({ initials = 'AK' }: { initials?: string }) {
  return (
    <span className="flex h-[var(--spacing-48)] w-[var(--spacing-48)] shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-bg-subtle)] text-heading-24 text-[var(--color-action-text)]">
      {initials}
    </span>
  );
}

export function DriverProfile({
  title = 'Driver',
  keyFact = 'Alexey K.',
  body = 'Northway Freight · driver',
  initials = 'AK',
  verified = false,
  verifiedStyle = 'row',
  country,
}: {
  /** Figma text property `Title#769:0`. */
  title?: string;
  /** Figma text property `Key fact#769:2`. */
  keyFact?: string;
  /** Figma text property `Body#769:1`. The set's default is "Northway Freight\nRole: driver"; the
   *  variant and all nine instances render "Northway Freight · driver" — the render wins. */
  body?: string;
  /** Figma `Pharos/App/Driver avatar` → text property `Initials#755:0`. */
  initials?: string;
  /** Figma boolean property `Show verification#769:5`. TRUE in the set, FALSE in all nine instances. */
  verified?: boolean;
  /** `row` = the set's own state (dot + "Verified" on its own row, 100 tall).
   *  `inline` = compact polish: dot + "Verified" appended to the body line, stays 82 tall. */
  verifiedStyle?: 'row' | 'inline';
  /** Figma boolean `Show country flag#769:3` + instance swap `Country flag#769:4`. Off in the set. */
  country?: string;
  /** Figma variant property `Density` — the set only ships `Compact`. */
  density?: 'compact';
}) {
  return (
    <div className="box-border flex w-[var(--card-w)] items-center gap-[var(--spacing-12)] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[var(--spacing-12)]">
      <DriverAvatar initials={initials} />

      <div className="flex min-w-0 flex-1 flex-col gap-[var(--spacing-2)]">
        {/* "Title and country" — hugs its text in Figma (35 wide for "Driver") */}
        <div className="flex h-[var(--spacing-16)] w-fit items-center gap-[var(--spacing-6)]">
          <span className="text-heading-12 text-[var(--color-text-primary)]">
            {title}
          </span>
          {country && <Flag country={country} size={16} />}
        </div>

        <span className="text-heading-14 text-[var(--color-text-primary)]">
          {keyFact}
        </span>

        <span className="text-caption-12 text-[var(--color-text-secondary)]">
          {body}
          {verified && verifiedStyle === 'inline' && (
            <span className="text-[var(--color-status-success-text)]">
              {' · '}
              <span aria-hidden className="mr-[4px] inline-block h-[6px] w-[6px] rounded-[var(--radius-pill)] bg-current align-middle" />
              Verified
            </span>
          )}
        </span>

        {verified && verifiedStyle === 'row' && (
          <span className="flex h-[var(--spacing-16)] w-fit items-center gap-[var(--spacing-6)] rounded-[var(--radius-pill)] text-label-12 text-[var(--color-status-success-text)]">
            <span aria-hidden className="h-[var(--spacing-6)] w-[var(--spacing-6)] shrink-0 rounded-[var(--radius-pill)] bg-current" />
            <span>Verified</span>
          </span>
        )}
      </div>
    </div>
  );
}
