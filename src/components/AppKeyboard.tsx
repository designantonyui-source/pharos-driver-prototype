/**
 * figma: 2776:1613 · Pharos/App/Keyboard (COMPONENT, 402x258) — 3 identical instances on page 30
 *        (2776:1787, 2776:1961, 2776:2112), all 402x258 with no component properties.
 * props: none — a static, presentational mock of the iOS keyboard.
 *
 *   Root 402x258, fill #eff2f5 (color/bg/subtle), no stroke. Keys are plain rectangles:
 *     32x42, r5 (no token — 5 is inlined), fill #ffffff
 *     row y 8 / 58 / 108 / 158 (42 tall, 8 between rows), first row starts 8 from the top
 *     row 1: 10 keys, x 14 … 356 (step 38 = 32 + 6)  → 14 left / 14 right inset
 *     row 2: 9 keys,  x 33 … 337                     → 33 left / 33 right inset
 *     row 3: 9 keys,  x 33 … 337 — shift, z x c v b n m, backspace
 *     row 4: "123" 88x88 … x 14 (88 wide), space x 108 (182 wide), return x 296 (88 wide),
 *            all gap 6 → 14+88+6+182+6+88 = 384, i.e. 14 left / 18 right inset (asymmetric in
 *            Figma, reproduced as drawn)
 *     glyph  DM Sans Regular 16/20 #172a35, box = key width x 20, y = key y + 11 (centred),
 *            textAlign CENTER/TOP. The space key's glyph layer is an empty string.
 *
 *   The bottom 58px of the 258-tall frame is EMPTY in Figma — rows end at y 200. This is drawn
 *   as-is; the keyboard is a visual mock, so the keys are not focusable controls and emit
 *   nothing (the component has no interactive states in Figma either).
 *
 * tokens: color-bg-subtle, color-bg-surface, color-text-primary, text-body-16
 * TODO(token): key radius 5, key 32x42, the six-px key gap and the row insets are Figma
 *   geometry with no matching spacing/radius token (radius has 4 and 8, spacing has 4/6/8).
 *   (`Glyph` is a 20-tall text layer whose lineHeight property is 24 — the line box overflows the
 *   layer, so the ink sits 11+2 px below the key top, not centred).
 */
const ROW_1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
const ROW_2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
const ROW_3 = ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'];
const ROW_4: { glyph: string; width: number }[] = [
  { glyph: '123', width: 88 },
  { glyph: '', width: 182 },
  { glyph: 'return', width: 88 },
];

function Key({ glyph, width = 32 }: { glyph: string; width?: number }) {
  return (
    <span
      className="flex h-[42px] shrink-0 items-start justify-center rounded-[var(--radius-5)] bg-[var(--color-bg-surface)] pt-[11px]"
      style={{ width }}
    >
      {/* Figma quirk: the `Glyph` layer is a 20-tall box (top at key y+11) but its line height is
          24 — the line box overflows the layer. `items-start` + pt-11 + text-body-16 (16/24)
          reproduces it; centring a 24-tall line box would sit the ink 2px too high (measured). */}
      <span className="text-body-16 text-[var(--color-text-primary)]">{glyph}</span>
    </span>
  );
}

export function AppKeyboard() {
  return (
    <div className="flex h-[258px] w-full flex-col gap-[8px] bg-[var(--color-bg-subtle)] pt-[8px]">
      <div className="flex gap-[6px] pl-[14px]">
        {ROW_1.map((glyph) => (
          <Key key={glyph} glyph={glyph} />
        ))}
      </div>
      <div className="flex gap-[6px] pl-[33px]">
        {ROW_2.map((glyph) => (
          <Key key={glyph} glyph={glyph} />
        ))}
      </div>
      <div className="flex gap-[6px] pl-[33px]">
        {ROW_3.map((glyph) => (
          <Key key={glyph} glyph={glyph} />
        ))}
      </div>
      <div className="flex gap-[6px] pl-[14px]">
        {ROW_4.map((key) => (
          <Key key={key.glyph || 'space'} glyph={key.glyph} width={key.width} />
        ))}
      </div>
    </div>
  );
}
