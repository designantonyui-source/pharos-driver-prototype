/**
 * Token guard: every `var(--x)` used in src/ must exist in the generated tokens.
 *
 * Why this exists: an undefined CSS variable does not warn. Inside a shorthand it
 * makes the browser drop the whole declaration, so a control silently renders with
 * no border and no background. That is exactly how Input shipped broken — it looked
 * "empty", not broken (see design/PORT-LOG.md, trap 4).
 *
 * Usage: pnpm lint:tokens   (also part of `pnpm check`)
 *
 * Dynamic names are understood: a template literal such as
 *   var(--color-status-${tone}-bg)
 * is matched against every defined `--color-status-*-bg`. A dynamic prefix with no
 * matching token at all is reported, because that is the same silent failure.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const GENERATED = ['src/styles/tokens.css', 'src/styles/globals.css'];

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const defined = new Set();
for (const file of GENERATED) {
  const css = readFileSync(join(root, file), 'utf8');
  for (const m of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)) defined.add(m[1]);
}

const problems = [];
const dynamic = [];
let checked = 0;

for (const file of walk(join(root, 'src')).filter((f) => /\.(tsx?|css)$/.test(f))) {
  const rel = relative(root, file);
  if (GENERATED.includes(rel)) continue;
  const source = readFileSync(file, 'utf8');

  // drop the dynamic ones first so they are not reported as a missing literal
  const withoutDynamic = source.replace(/var\((--[a-zA-Z0-9-]*)\$\{[^}]*\}([a-zA-Z0-9-]*)\)/g, (_, prefix, suffix) => {
    const matches = [...defined].filter((v) => v.startsWith(prefix) && v.endsWith(suffix));
    dynamic.push({ file: rel, name: `${prefix}\${…}${suffix}`, matches: matches.length });
    if (matches.length === 0) problems.push({ file: rel, name: `${prefix}\${…}${suffix}`, reason: 'no token matches this dynamic name' });
    return 'var(RESOLVED-DYNAMIC)';
  });

  for (const m of withoutDynamic.matchAll(/var\((--[a-zA-Z0-9-]+)/g)) {
    checked++;
    if (!defined.has(m[1])) problems.push({ file: rel, name: m[1], reason: 'not defined in tokens.css / globals.css' });
  }
}

console.log(`token audit: ${checked} literal var() uses + ${dynamic.length} dynamic, ${defined.size} tokens defined`);
if (dynamic.length) {
  console.log(`  dynamic: ${dynamic.map((d) => `${d.name} → ${d.matches} token(s) [${d.file}]`).join('\n           ')}`);
}

if (problems.length) {
  console.error(`\nFAIL — ${problems.length} unresolved variable(s):`);
  for (const p of problems) console.error(`  ${p.name}  (${p.file}) — ${p.reason}`);
  console.error('\nAn undefined var() silently drops the whole declaration. Add the token to');
  console.error('design/tokens.json and run `pnpm tokens`, or use an existing token.');
  process.exit(1);
}
console.log('OK — every var() resolves to a token.');
