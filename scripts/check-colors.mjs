#!/usr/bin/env node
/**
 * Theme-token guardrail.
 *
 * Every client company gets its own brand colour applied at runtime via CSS
 * theme variables (see client/src/lib/theme.ts). Hardcoded colours — hex
 * literals or raw Tailwind palette utilities (bg-stone-200, text-amber-700…) —
 * cannot re-theme, so they must not be added.
 *
 * Use theme tokens instead:
 *   text-stone-900  → text-foreground        bg-stone-50   → bg-muted
 *   text-stone-500  → text-muted-foreground  border-stone-200 → border-border
 *   #a87a3a / amber → *-primary              green → *-success
 *   red   → *-destructive                    blue  → *-info
 *
 * This is a RATCHET, not a clean gate: the repo still contains intentional
 * hardcoded colours (categorical palettes for pickers / type badges / legends,
 * decorative banner art, and the brand-colour defaults themselves). Those are
 * recorded in color-baseline.json. The check fails only when a file gains MORE
 * violations than its baseline — so regressions are blocked and cleanup is free.
 *
 *   npm run check:colors            # verify no new hardcoded colours
 *   npm run check:colors -- --update  # re-baseline (intentional changes only)
 *
 * Escape hatch: append `// theme-allow` to a line to exclude it (use for
 * genuinely categorical colour data).
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const BASELINE = join(HERE, "color-baseline.json");
const UPDATE = process.argv.includes("--update");

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|" +
  "teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const PREFIX =
  "bg|text|border|ring|from|to|via|fill|stroke|divide|outline|decoration|shadow|accent|caret|placeholder";

const RE_UTILITY = new RegExp(`\\b(?:${PREFIX})-(?:${PALETTE})-[0-9]{2,3}(?:\\/[0-9]{1,3})?\\b`, "g");
const RE_HEX = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/g;
const ALLOW_COMMENT = /\/\/\s*theme-allow|\/\*\s*theme-allow/;

const files = execSync(`git -C ${ROOT} ls-files 'client/src/*.ts' 'client/src/*.tsx'`, {
  encoding: "utf8",
}).trim().split("\n").filter(Boolean);

/** @type {Record<string, number>} */
const counts = {};
/** @type {Array<{file:string,line:number,text:string,hits:string[]}>} */
const all = [];

for (const rel of files) {
  const lines = readFileSync(join(ROOT, rel), "utf8").split("\n");
  lines.forEach((line, i) => {
    if (ALLOW_COMMENT.test(line)) return;
    const hits = [...(line.match(RE_UTILITY) || []), ...(line.match(RE_HEX) || [])];
    if (hits.length === 0) return;
    counts[rel] = (counts[rel] || 0) + hits.length;
    all.push({ file: rel, line: i + 1, text: line.trim().slice(0, 100), hits });
  });
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);

if (UPDATE) {
  writeFileSync(BASELINE, JSON.stringify({ total, files: counts }, null, 2) + "\n");
  console.log(`✅ Baseline updated: ${total} hardcoded colours across ${Object.keys(counts).length} files.`);
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error("No color-baseline.json found. Run: npm run check:colors -- --update");
  process.exit(1);
}

const base = JSON.parse(readFileSync(BASELINE, "utf8")).files || {};
const regressions = Object.entries(counts)
  .map(([file, n]) => ({ file, n, was: base[file] || 0 }))
  .filter((r) => r.n > r.was);

if (regressions.length === 0) {
  const cleaned = total < (JSON.parse(readFileSync(BASELINE, "utf8")).total ?? total);
  console.log(`✅ No new hardcoded colours (${total} known, baselined).`);
  if (cleaned) console.log("   Nice — the count went down. Re-baseline with: npm run check:colors -- --update");
  process.exit(0);
}

console.error("❌ New hardcoded colours found — use theme tokens so each company's brand colour applies.\n");
for (const r of regressions) {
  console.error(`  ${r.file}  (${r.was} → ${r.n})`);
  for (const v of all.filter((v) => v.file === r.file).slice(0, 8)) {
    console.error(`    ${String(v.line).padStart(4)}: ${v.hits.join(", ")}\n          ${v.text}`);
  }
}
console.error(`
  Replace with tokens, e.g.
    text-stone-900 → text-foreground     text-stone-500  → text-muted-foreground
    bg-stone-50    → bg-muted            border-stone-200 → border-border
    amber/#a87a3a  → *-primary           green → *-success
    red            → *-destructive       blue  → *-info

  If the colour is genuinely categorical (a picker swatch, type badge, or
  legend where hues carry meaning), append \`// theme-allow\` to the line.
`);
process.exit(1);
