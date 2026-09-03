# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` — start dev server (Next.js, http://localhost:3000)
- `pnpm build` — production build (SSG/ISR for vehicle pages)
- `pnpm lint` — ESLint
- `pnpm start` — serve the production build

No test suite is configured.

## Architecture

Next.js (App Router) app that looks up vehicle CRSP data from an Excel file, with SSR/SSG vehicle detail pages for SEO.

```
data/crsp.xlsx (Excel data)
    -> src/lib/crsp.js (loads + caches sheet in memory, 5-min TTL)
    -> src/app/api/search/route.js (live search API, used by the home page)
    -> src/app/vehicles/[slug]/page.js (SSR/ISR: all trims for a Make+Model)
    -> src/app/vehicles/[slug]/[modelNumber]/page.js (SSG+ISR: one exact trim, SEO metadata + JSON-LD)
    -> src/app/sitemap.js (dynamic sitemap listing every vehicle URL)

src/components/SearchHome.jsx (client) -> useDebounce (300ms) -> useVehicleSearch (AbortController per keystroke)
    -> /api/search -> Dropdown (shadcn Command) -> Link to /vehicles/[slug]/[modelNumber]
```

- `src/lib/crsp.js`: reads `data/crsp.xlsx` with the `xlsx` package (`range: 1` — skips a header row), caches the parsed rows in a module-level variable for 5 minutes (`getAllVehicles()`). Used by both the API route and the server-rendered vehicle pages — do not duplicate the Excel-loading logic elsewhere.
- `src/lib/slug.js`: `makeModelSlug(vehicle)` builds the `/vehicles/[slug]` segment from Make+Model; `encodeModelNumber(modelNumber)` builds the `[modelNumber]` segment — it extends `encodeURIComponent` to also escape `* ! ' ( )`, which some model numbers contain and which break static file generation on Windows/some filesystems. Always use `encodeModelNumber`, never raw `encodeURIComponent`, when linking to a vehicle detail page.
- Multiple rows can share the same Make+Model (different trims/model numbers) — `/vehicles/[slug]` lists them all, `/vehicles/[slug]/[modelNumber]` is the exact trim.
- `src/app/vehicles/[slug]/[modelNumber]/page.js` uses `generateStaticParams()` to pre-render every vehicle at build time (SSG) and `revalidate = 3600` for ISR after that — new/changed rows in the Excel file are picked up on the next revalidation without a redeploy, up to the 1-hour window.
- `next.config.mjs` sets `serverExternalPackages: ["xlsx"]` — without it, Turbopack bundles `xlsx` in a way that breaks its file-path resolution relative to `process.cwd()`. Also sets `agentRules: false` to stop Next.js's `next dev` from auto-appending its own block to this repo's `AGENTS.md` on every dev run.
- Dark mode uses `next-themes` (`src/components/ThemeProvider.jsx`), attribute `"class"`, matching the `.dark` selector already defined in `src/app/globals.css`. This avoids the SSR hydration flash a `localStorage`-only approach would cause.
- UI is shadcn/ui (`components.json`, `src/components/ui/`) on Tailwind CSS v4. Search suggestions use shadcn's `Command`/`CommandItem`; selecting one navigates via `next/navigation`'s `useRouter` to the vehicle's detail page rather than showing an inline preview — this is what makes results crawlable/shareable.
- Package manager is **pnpm** (`pnpm-lock.yaml`) — do not reintroduce `package-lock.json`.

## Conventions and gotchas

- Search matching is whitespace-sensitive in the query split logic (`useVehicleSearch.js`) — extra/missing spaces change how make/model are parsed.
- Vehicle field names in components come straight from Excel column headers (e.g. `item.Make`, `item.Model`, `item["Model number"]`), so adding a column requires no server-side mapping — just reference the new key in `src/components/SelectedVehicle.jsx`.
- To add a search filter: extend the filter logic in `src/app/api/search/route.js`, then update the query parsing in `useVehicleSearch.js`, then wire up UI in `SearchHome.jsx`.
- Cache TTL in `src/lib/crsp.js` is the literal `300000` (ms); adjust there if data updates more/less frequently than every 5 minutes.
- Adding shadcn components: `pnpm dlx shadcn@latest add <component>`.
