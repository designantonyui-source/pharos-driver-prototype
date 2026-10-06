import france from '../assets/flags/france.svg';
import belgium from '../assets/flags/belgium.svg';

/**
 * figma: 249:1646 (Pharos/Country flag Rectangle) · 249:1647 Country=France · 249:1649 Country=Belgium
 *   every variant is 24x24: white box, 3:2 flag art 24x16 centred (y 4), 1px #cbd5da outline (r 2)
 *   the app instances the set at 18x18 (Offer 2658:1312 France / 2658:1322 Belgium) and the shipped
 *   assets are that export, so `size` defaults to 18; pass 24 for the component's own geometry.
 * props: country, size
 * tokens: none — the flag art is a Figma SVG export (src/assets/flags), its colours live in the asset
 */
const FLAGS: Record<string, string> = { France: france, Belgium: belgium };

export function Flag({ country, size = 18 }: { country: keyof typeof FLAGS | string; size?: number }) {
  const src = FLAGS[country] ?? france;
  return <img src={src} alt={country} width={size} height={size} className="shrink-0" />;
}
