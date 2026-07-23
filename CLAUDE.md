# EngageX

Employee appreciation + R&R HR app. TypeScript + React + Tailwind + shadcn/ui + react-router-dom (HashRouter). No backend — all state in localStorage under `engagex_*` keys.

## Conventions
- Mobile employee app: `/m/*` routes; HR admin web app: root
- Default brand color: `#a87a3a`, font is "DM Sans" via `font-mobile` class
- Reuse shadcn primitives in `client/src/components/ui/`
- Account state is in `client/src/lib/account.ts`
- All storage keys prefixed `engagex_`

## Colors — never hardcode
Each client company gets its own brand colour applied at runtime, so **no hex
literals and no raw Tailwind palette utilities** (`bg-stone-200`, `text-amber-700`,
`#a87a3a`). Always use theme tokens:

| Instead of | Use |
|---|---|
| `text-stone-900/800` | `text-foreground` |
| `text-stone-700…300` | `text-muted-foreground` |
| `border-stone-100/200/300` | `border-border` |
| `bg-stone-50/100/200` | `bg-muted` |
| amber / gold / `#a87a3a` | `bg-primary` / `text-primary` (+ `text-primary-foreground` on solid) |
| green | `*-success` · red → `*-destructive` · blue → `*-info` |
| chart colours | `var(--primary)`, `var(--chart-1..5)`, `var(--border)` |

Tokens are defined in `client/src/index.css` and mapped in `tailwind.config.ts`.
`client/src/lib/theme.ts` pushes `account.brandColor` into `--primary` at runtime
(applied on boot/navigation in `App.tsx` and on save in `pages/hr-settings.tsx`).

Exception: genuinely **categorical** colours — picker swatches, type/tier badges,
legends where the hue carries meaning (e.g. `lib/badges-catalog.ts`,
`components/recognition/category-editor.tsx`) — stay as palette values. Mark such
lines `// theme-allow`.

Run `npm run check:colors` before committing; it fails on *new* hardcoded colours
(existing ones are baselined in `scripts/color-baseline.json`).

## Before making code changes
Read `client/src/App.tsx`, `client/src/lib/account.ts`, and the page being modified. Reuse existing patterns; don't introduce new state libraries.