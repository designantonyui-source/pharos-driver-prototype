/**
 * design/tokens.json  ->  src/styles/tokens.css
 * Source of truth is Figma: variables + text styles (see design/figma-map.md).
 * Usage: pnpm tokens
 */
import { readFileSync, writeFileSync } from 'node:fs';

const tokens = JSON.parse(readFileSync(new URL('../design/tokens.json', import.meta.url), 'utf8'));
const lines = [];
for (const [group, values] of Object.entries(tokens)) {
  for (const [name, value] of Object.entries(values)) {
    lines.push(`  --${group}-${name}: ${value};`);
  }
}
const css = `/* AUTO-GENERATED from design/tokens.json — do not edit by hand. */\n:root {\n${lines.join('\n')}\n}\n`;
writeFileSync(new URL('../src/styles/tokens.css', import.meta.url), css);
console.log(`tokens.css written: ${lines.length} variables`);
