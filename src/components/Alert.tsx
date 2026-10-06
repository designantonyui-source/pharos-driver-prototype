/**
 * figma: Pharos/Alert (575:9632) — types Info / Warning / Error / Success / Neutral
 * tokens: alert-bg-{type}, alert-text-{type}, radius-md, text-label-14, text-body-14
 */
export type AlertType = 'info' | 'warning' | 'error' | 'success' | 'neutral';

export function Alert({ title, children, type = 'info' }: { title: string; children?: React.ReactNode; type?: AlertType }) {
  return (
    <div className="flex w-[370px] flex-col gap-[8px] rounded-[var(--radius-md)] p-[16px]" style={{ background: `var(--color-alert-bg-${type})`, color: `var(--color-alert-text-${type})` }}>
      <span className="text-label-14">{title}</span>
      {children && <span className="text-body-14 opacity-90">{children}</span>}
    </div>
  );
}
