# EngageX

Employee appreciation + R&R HR app. TypeScript + React + Tailwind + shadcn/ui + react-router-dom (HashRouter). No backend — all state in localStorage under `engagex_*` keys.

## Conventions
- Mobile employee app: `/m/*` routes; HR admin web app: root
- Brand color: `#a87a3a`, font is "DM Sans" via `font-mobile` class
- Reuse shadcn primitives in `client/src/components/ui/`
- Account state is in `client/src/lib/account.ts`
- All storage keys prefixed `engagex_`

## Before making code changes
Read `client/src/App.tsx`, `client/src/lib/account.ts`, and the page being modified. Reuse existing patterns; don't introduce new state libraries.