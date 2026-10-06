import france from '../assets/flags/france.svg';
import belgium from '../assets/flags/belgium.svg';

/** figma: Pharos/Country flag Rectangle (18x18) — exported from Figma, do not redraw. */
const FLAGS: Record<string, string> = { France: france, Belgium: belgium };

export function Flag({ country, size = 18 }: { country: keyof typeof FLAGS | string; size?: number }) {
  const src = FLAGS[country] ?? france;
  return <img src={src} alt={country} width={size} height={size} className="shrink-0" />;
}
