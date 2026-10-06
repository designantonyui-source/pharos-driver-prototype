/**
 * design/tokens.json -> src/styles/tokens.css + Tailwind @theme bridge.
 * Source of truth: Figma variables + text styles (see design/figma-map.md).
 * Usage: pnpm tokens
 */
import { readFileSync, writeFileSync } from 'node:fs';

const tokens = JSON.parse(readFileSync(new URL('../design/tokens.json', import.meta.url), 'utf8'));
const families = { ios: "'SF Pro Text', -apple-system, system-ui, sans-serif" };
const lines = [];
let count = 0;

for (const [group, values] of Object.entries(tokens)) {
  if (group === 'text') continue;
  for (const [name, value] of Object.entries(values)) {
    lines.push(`  --${group}-${name}: ${value};`);
    count++;
  }
}
// typography: Tailwind v4 reads --text-<name>, --text-<name>--line-height, --text-<name>--font-weight
lines.push('');
lines.push('  /* typography (Pharos text styles) */');
for (const [name, t] of Object.entries(tokens.text ?? {})) {
  const family = t.family === 'heading' ? 'var(--font-heading)' : t.family === 'ios' ? families.ios : 'var(--font-ui)';
  lines.push(`  --text-${name}: ${t.size};`);
  lines.push(`  --text-${name}--line-height: ${t.line};`);
  lines.push(`  --text-${name}--font-weight: ${t.weight};`);
  lines.push(`  --text-${name}--font-family: ${family};`);
  count += 4;
}
lines.push('');
lines.push('  /* families */');
lines.push(`  --font-ui: ${tokens.font.ui};`);
lines.push(`  --font-heading: ${tokens.font.heading};`);
count += 2;

const css = `/* AUTO-GENERATED from design/tokens.json — do not edit by hand (pnpm tokens).\n   Tailwind v4 @theme: every token is both a CSS variable and a utility. */\n/* static: emit every token, even the ones referenced through dynamic names */\n@theme static {\n${lines.join('\n')}\n}\n`;
writeFileSync(new URL('../src/styles/tokens.css', import.meta.url), css);
console.log(`tokens.css written: ${count} variables`);
