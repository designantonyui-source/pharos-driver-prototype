import france from '../assets/flags/france.svg';
import belgium from '../assets/flags/belgium.svg';
import franceCircle from '../assets/flags/france-circle.svg';
import belgiumCircle from '../assets/flags/belgium-circle.svg';

/**
 * figma: 249:1646 (Pharos/Country flag Rectangle) · 249:1647 Country=France · 249:1649 Country=Belgium
 *   every variant is 24x24: white box, 3:2 flag art 24x16 centred (y 4), 1px #cbd5da outline (r 2)
 *   the app instances the set at 18x18 (Offer 2658:1312 France / 2658:1322 Belgium) and the shipped
 *   assets are that export, so `size` defaults to 18; pass 24 for the component's own geometry.
 * props: country, size, shape
 * tokens: none — the flag art is a Figma SVG export (src/assets/flags), its colours live in the asset
 *
 * shape="circle" — a SECOND Figma component, not a variant of the square set: `198:1640`
 *   (Country=France) and `198:1645` (Country=Belgium), each 24x24 and holding an instance of a
 *   circular lucide-style flag master (`FR` = `172:3598`: one #F0F0F0 circle plus two stripes,
 *   no outline). `Pharos/Location suggestions` swaps these in via its `First/Second flag`
 *   INSTANCE_SWAP properties (198:1640 is the default; instance `203:513` uses 198:1645).
 *   Both circle assets are direct SVG exports of those two nodes.
 *
 * DEFECT in Figma (not fixed here on purpose): the Belgian flag's leading stripe is authored
 *   `#000000` in BOTH the square set (`249:1668`) and the circle (`198:1645`), i.e. a black
 *   band where the Belgian flag has red. `src/assets/flags/belgium.svg` (ported earlier) carries
 *   the same black, so this export matches Figma and the existing asset; it needs a design fix
 *   in Figma, after which both assets must be re-exported.
 */
const RECT: Record<string, string> = { France: france, Belgium: belgium };
const CIRCLE: Record<string, string> = { France: franceCircle, Belgium: belgiumCircle };

export function Flag({
  country,
  size = 18,
  shape = 'rect',
  className,
}: {
  country: keyof typeof RECT | string;
  size?: number;
  /** `rect` is Pharmos/Country flag Rectangle (249:1646); `circle` is 198:1640 / 198:1645. */
  shape?: 'rect' | 'circle';
  className?: string;
}) {
  const art = shape === 'circle' ? CIRCLE : RECT;
  const src = art[country] ?? RECT.France;
  return (
    <img src={src} alt={country} width={size} height={size} className={`shrink-0 ${className ?? ''}`} />
  );
}
