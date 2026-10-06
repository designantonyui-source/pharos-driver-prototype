/**
 * design/tokens.json -> src/styles/tokens.css + Tailwind @theme bridge.
 * Source of truth: Figma variables + text styles (see design/figma-map.md).
 * Usage: pnpm tokens
 */
import { readFileSync, writeFileSync } from 'node:fs';

const tokens = JSON.parse(readFileSync(new URL('../design/tokens.json', import.meta.url), 'utf8'));
/** Figma text styles name a family by role; `text.*.family` refers to one of these. */
const familyOf = (role) => `var(--font-${role === 'ui' ? 'ui' : role})`;
const lines = [];
let count = 0;

for (const [group, values] of Object.entries(tokens)) {
  if (group === 'text' || group === 'font') continue;
  for (const [name, value] of Object.entries(values)) {
    lines.push(`  --${group}-${name}: ${value};`);
    count++;
  }
}
// typography: Tailwind v4 reads --text-<name>, --text-<name>--line-height, --text-<name>--font-weight
lines.push('');
lines.push('  /* typography (Pharos text styles) */');
for (const [name, t] of Object.entries(tokens.text ?? {})) {
  const family = familyOf(t.family ?? 'ui');
  lines.push(`  --text-${name}: ${t.size};`);
  lines.push(`  --text-${name}--line-height: ${t.line};`);
  lines.push(`  --text-${name}--font-weight: ${t.weight};`);
  lines.push(`  --text-${name}--font-family: ${family};`);
  count += 4;
}
lines.push('');
lines.push('  /* families */');
for (const [role, stack] of Object.entries(tokens.font)) {
  lines.push(`  --font-${role === 'ui' ? 'ui' : role}: ${stack};`);
  count++;
}

/**
 * Tailwind v4's `--text-*` namespace carries line-height, letter-spacing and font-weight,
 * but NOT a font family — `--text-<name>--font-family` is simply ignored. Every heading
 * therefore rendered in the UI family and Manrope was never even downloaded.
 * So the generator emits the family bridge itself: one unlayered rule per family, which
 * also beats Tailwind's @layer utilities.
 */
const byFamily = new Map();
for (const [name, t] of Object.entries(tokens.text ?? {})) {
  const family = familyOf(t.family ?? 'ui');
  if (!byFamily.has(family)) byFamily.set(family, []);
  byFamily.get(family).push(`.text-${name}`);
}
const bridgeGroups = new Set(byFamily.keys());
const fontFamilyBridges = byFamily.size
  ? `\n/* font-family bridge — see tools/export-tokens.mjs */\n${[...byFamily.entries()]
      .map(([family, selectors]) => `${selectors.join(',\n')} { font-family: ${family}; }`)
      .join('\n')}\n`
  : '';

const css = `/* AUTO-GENERATED from design/tokens.json — do not edit by hand (pnpm tokens).\n   Tailwind v4 @theme: every token is both a CSS variable and a utility. */\n/* static: emit every token, even the ones referenced through dynamic names */\n@theme static {\n${lines.join('\n')}\n}\n${fontFamilyBridges}`;
writeFileSync(new URL('../src/styles/tokens.css', import.meta.url), css);
console.log(`tokens.css written: ${count} variables, ${bridgeGroups.size} font-family bridges`);
