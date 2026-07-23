// ──────────────────────────────────────────────────────────────────────
// Brand theming — pushes a company's brand color into the CSS variables the
// whole UI reads from (`--primary`, `--ring`, sidebar tokens…). This is what
// makes per-company theming live: any component using `bg-primary`,
// `text-primary`, `ring-primary`, etc. re-themes automatically.
//
// Colors must never be hardcoded in components — route them through these
// tokens so a single brand color can recolor the entire app.
// ──────────────────────────────────────────────────────────────────────

/** Canonical fallback brand color (gold) — matches CLAUDE.md and the app default. */
export const DEFAULT_BRAND_COLOR = "#a87a3a";

interface HSL {
  h: number;
  s: number;
  l: number;
}

/** Parse a #rgb / #rrggbb hex string into HSL. Returns null on malformed input. */
function hexToHsl(hex: string): HSL | null {
  let value = hex.trim().replace(/^#/, "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;

  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** Relative luminance (0–1) of a hex color, used to pick a readable foreground. */
function luminance(hex: string): number {
  let value = hex.trim().replace(/^#/, "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return 0;
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = channel(parseInt(value.slice(0, 2), 16));
  const g = channel(parseInt(value.slice(2, 4), 16));
  const b = channel(parseInt(value.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Apply a company's brand color to the document's theme tokens. Safe to call
 * on every navigation — it only rewrites CSS variables when the color parses.
 */
export function applyBrandColor(hex: string | null | undefined): void {
  if (typeof document === "undefined") return;
  const hsl = hexToHsl(hex ?? DEFAULT_BRAND_COLOR);
  if (!hsl) return;

  const color = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  // Dark text on light brand colors, white text on dark brand colors.
  const foreground = luminance(hex ?? DEFAULT_BRAND_COLOR) > 0.6 ? "hsl(20, 14.3%, 4.1%)" : "hsl(0, 0%, 100%)";

  const root = document.documentElement;
  root.style.setProperty("--primary", color);
  root.style.setProperty("--primary-foreground", foreground);
  root.style.setProperty("--ring", color);
  root.style.setProperty("--sidebar-primary", color);
  root.style.setProperty("--sidebar-primary-foreground", foreground);
  root.style.setProperty("--sidebar-ring", color);
  root.style.setProperty("--chart-1", color);
}
