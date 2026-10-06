import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react';

/**
 * figma: 575:9632 · Pharos/Alert — Type=Info `575:9552` · Warning `575:9606` · Error `575:9611` ·
 *        Success `575:9616` · Neutral `2588:1536` (each 546x64)
 * props: title, children, detail, type
 *
 *   HORIZONTAL pad12 gap12 r12 · fill color/alert/<tone>/bg · text color/alert/<tone>/text
 *   icon 20x20 vertically centred in the alert (y 22 of 64)
 *   content VERTICAL gap4 at x 44 · title Label/14 Medium (20) · description Caption/12 (16) ·
 *   detail Caption/12 (16, hidden in Figma by default) — a visible detail makes the alert 84 tall
 *   Figma icons resolve by main component, not by layer name (the layers lie):
 *   Info→Info, Warning→Triangle Alert, Error→Circle X, Success→Circle Check, Neutral→Circle Check
 *   (Neutral's layer is called "Icon / Info" but its main component is Lucide/Icon/Circle Check)
 *
 * tokens: color-alert-{neutral,info,success,warning,danger}-bg / -text, radius-md
 */
export type AlertType = 'info' | 'warning' | 'error' | 'success' | 'neutral';

const ICONS = { info: Info, warning: TriangleAlert, error: CircleX, success: CircleCheck, neutral: CircleCheck };
/** Figma token suffixes: the Error variant uses the `danger` tokens (alert/bg/danger, alert/text/danger). */
const TOKEN = { info: 'info', warning: 'warning', error: 'danger', success: 'success', neutral: 'neutral' } as const;

export function Alert({
  title,
  children,
  detail,
  type = 'info',
}: {
  title: string;
  children?: React.ReactNode;
  detail?: string;
  type?: AlertType;
}) {
  const Icon = ICONS[type];
  return (
    <div
      className="flex w-full items-center gap-[12px] rounded-[var(--radius-md)] p-[12px]"
      style={{ background: `var(--color-alert-${TOKEN[type]}-bg)`, color: `var(--color-alert-${TOKEN[type]}-text)` }}
    >
      <Icon size={20} strokeWidth={2} className="shrink-0" />
      <div className="flex flex-col gap-[4px]">
        <span className="text-label-14">{title}</span>
        {children && <span className="text-caption-12">{children}</span>}
        {detail && <span className="text-caption-12">{detail}</span>}
      </div>
    </div>
  );
}
