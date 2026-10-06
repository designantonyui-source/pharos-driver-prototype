import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';

/**
 * figma: Pharos/Alert (575:9632) — Type Info / Warning / Error / Success / Neutral
 *   HORIZONTAL gap12 pad12 · Icon 20x20 · content VERTICAL gap4 · title Label/14 · description Caption/12
 * tokens: color-alert-bg-*, color-alert-text-*, radius-md
 */
export type AlertType = 'info' | 'warning' | 'error' | 'success' | 'neutral';

const ICONS = { info: Info, warning: TriangleAlert, error: CircleAlert, success: CircleCheck, neutral: Info };
/** Figma token suffixes: the Error variant uses the `danger` tokens (alert/bg/danger, alert/text/danger). */
const TOKEN = { info: 'info', warning: 'warning', error: 'danger', success: 'success', neutral: 'neutral' } as const;

export function Alert({ title, children, type = 'info' }: { title: string; children?: React.ReactNode; type?: AlertType }) {
  const Icon = ICONS[type];
  return (
    <div
      className="flex w-full items-center gap-[12px] rounded-[var(--radius-md)] p-[12px]"
      style={{ background: `var(--color-alert-bg-${TOKEN[type]})`, color: `var(--color-alert-text-${TOKEN[type]})` }}
    >
      <Icon size={20} className="shrink-0" />
      <div className="flex flex-col gap-[4px]">
        <span className="text-label-14">{title}</span>
        {children && <span className="text-caption-12">{children}</span>}
      </div>
    </div>
  );
}
