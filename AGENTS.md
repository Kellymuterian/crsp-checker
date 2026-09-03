# CRSP Checker - Agent Instructions

A Next.js (App Router) vehicle search application that helps users find CRSP (Current Retail Selling Price) data for vehicles in Kenya, with SSR/SSG per-vehicle pages for SEO.

## Quick Start

- **Dev server**: `pnpm dev` → http://localhost:3000
- **Build**: `pnpm build` (statically pre-renders every vehicle page via `generateStaticParams`)
- **Lint**: `pnpm lint`
- **Start production build**: `pnpm start`

Package manager is **pnpm** — do not use `npm`/`yarn`, and do not commit a `package-lock.json`.

## Architecture

### Data Flow

```
Excel Data (data/crsp.xlsx)
    ↓ [src/lib/crsp.js loads and caches for 5 min]
    ├─→ API Route (/api/search) ──→ useVehicleSearch hook (debounce 300ms + AbortController)
    │       ↓                              ↓
    │   SearchHome.jsx  ←── suggestions ───┘
    │       ↓ [user selects a suggestion, router.push]
    └─→ /vehicles/[slug]              → all trims for a Make+Model (SSR/ISR)
        /vehicles/[slug]/[modelNumber] → one exact trim (SSG + ISR, SEO metadata + JSON-LD)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/crsp.js` | Loads + caches `data/crsp.xlsx` rows (5-min TTL). Shared by the API route and every vehicle page — the only place that touches the Excel file. |
| `src/lib/slug.js` | `makeModelSlug`, `findByMakeModelSlug`, `findByModelNumber`, `encodeModelNumber` — URL slug helpers. |
| `src/app/api/search/route.js` | Live search API used by the home page (case-insensitive Make filter, optional Model substring). |
| `src/app/page.js` + `src/components/SearchHome.jsx` | Home page — search input, dropdown, dark-mode toggle. |
| `src/app/vehicles/[slug]/page.js` | SSR/ISR page listing every trim for a Make+Model. |
| `src/app/vehicles/[slug]/[modelNumber]/page.js` | SSG+ISR page for one exact vehicle, with `generateMetadata` + JSON-LD `Vehicle` structured data. |
| `src/app/sitemap.js` | Dynamic sitemap — one entry per Make+Model page and per exact vehicle page. |
| `src/components/SelectedVehicle.jsx` | Vehicle detail card (shadcn `Card`), reused on the exact-vehicle page. |
| `src/components/Dropdown.jsx` | Search suggestions list (shadcn `Command`/`CommandItem`), each item links to its vehicle detail page. |
| `src/components/ThemeProvider.jsx` | Wraps `next-themes` for SSR-safe dark mode. |
| `src/hooks/useVehicleSearch.js` | Debounced search + request cancellation. |
| `src/hooks/useDebounce.js` | Reusable debounce hook (300ms default). |
| `src/services/vehicleApi.js` | Fetch client for `/api/search`. |

### Data Source

The application searches vehicle data from `data/crsp.xlsx` (Excel file).

- **Columns**: Make, Model, Model number, Engine Capacity, Transmission, Fuel, Body Type, Drive Configuration, CRSP (KES.), and others.
- **Search**: Case-insensitive filtering on Make (required) + Model (optional substring).
- **Caching**: 5-minute in-memory cache (`src/lib/crsp.js`) to avoid repeated Excel file reads.
- **Multiple trims**: Rows can share the same Make+Model with different `Model number` values (different trims) — this is why vehicle URLs are two levels deep.

## Development Conventions

### URL structure

- `/vehicles/{make-model-slug}` — e.g. `/vehicles/toyota-camry` — lists every trim for that Make+Model.
- `/vehicles/{make-model-slug}/{model-number}` — e.g. `/vehicles/toyota-camry/DAA-AXVH70-AEXSB` — the exact vehicle, SEO-optimized with per-vehicle `<title>`/description and JSON-LD.
- The `model-number` segment MUST be built with `encodeModelNumber()` from `src/lib/slug.js`, not raw `encodeURIComponent` — some model numbers contain `*`, which is unescaped by `encodeURIComponent` but breaks static file generation on Windows.
- `generateStaticParams()` in the `[modelNumber]` page pre-renders every vehicle at build time; `dynamicParams = true` and `revalidate = 3600` mean new rows still resolve on demand and everything refreshes hourly without a redeploy.

### Search Pattern

The search input is parsed as: first word = Make, remaining words = Model
```javascript
const [make = '', ...modelParts] = query.trim().toLowerCase().split(' ');
const model = modelParts.join(' ');
// e.g., "Toyota Camry" → make: "toyota", model: "camry"
```

### Request Cancellation

`useVehicleSearch` uses `AbortController` to cancel in-flight requests when:
- User types a new query (new request supersedes old one)
- Component unmounts

This prevents race conditions when results arrive out of order.

### Dark Mode

- Handled by `next-themes` (`ThemeProvider`, `attribute="class"`), not manual `localStorage`/`matchMedia` code — this avoids an SSR hydration flash.
- Toggle via the button in the top-right corner of the home page.
- Styling uses Tailwind's `dark:` variant, driven by the `.dark` class next-themes puts on `<html>`.

### UI Framework

- **Components**: shadcn/ui (`components.json`, `src/components/ui/`) — add more with `pnpm dlx shadcn@latest add <name>`.
- **Styling**: Tailwind CSS v4 (CSS-based config in `src/app/globals.css`, no `tailwind.config.js`).
- **Icons**: `lucide-react` (shadcn's default icon library).

## Common Tasks

### Add a new search filter

1. Modify the search API in `src/app/api/search/route.js` to filter additional fields.
2. Update `useVehicleSearch.js` to parse the new query parameter.
3. Add UI input in `SearchHome.jsx`.

### Update vehicle display

- Modify `src/components/SelectedVehicle.jsx` to show additional fields.
- Data structure comes straight from Excel columns (e.g., `item.Make`, `item.Model`, `item["Model number"]`) — no server-side mapping needed.

### Modify search caching

- Server cache (5 minutes): adjust `CACHE_TTL_MS` in `src/lib/crsp.js`.
- Page revalidation (1 hour): adjust `revalidate` in the two `src/app/vehicles/**/page.js` files and `src/app/sitemap.js` if you add one there.

## Common Pitfalls

- **Missing Excel file**: if `data/crsp.xlsx` doesn't exist, `getAllVehicles()` throws and both the API route and every vehicle page fail.
- **Encoding**: search is case-insensitive but whitespace-sensitive. Users must match spacing (e.g., "Toyota Camry" vs "toyota  camry").
- **Model number URL segment**: always go through `encodeModelNumber()` — see URL structure above.
- **`serverExternalPackages: ["xlsx"]`** in `next.config.mjs` is required — removing it breaks `xlsx`'s file resolution under Turbopack.
- **`agentRules: false`** in `next.config.mjs` stops `next dev` from re-appending its own block to this file — leave it set.
- **Large Excel files**: loading the entire file into memory each time (even with caching) may cause performance issues at scale. Consider SQLite or paginated loading if data grows significantly.

## Stack Details

- **Next.js**: v16.3.4 (App Router, Turbopack)
- **React**: v19.2.8
- **Tailwind**: v4 (CSS-based config, `@tailwindcss/postcss`)
- **shadcn/ui**: base-nova style, neutral base color
- **next-themes**: v0.4.6 (dark mode)
- **XLSX**: v0.18.5 (Excel file parsing)
- **ESLint**: v9 (`eslint-config-next`, includes React Hooks rules)
- **Package manager**: pnpm

## File Structure Notes

- `public/` — static files (Google Search Console verification file)
- `data/crsp.xlsx` — the Excel data source
- `src/app/` — Next.js App Router routes, layouts, API route, sitemap
- `src/components/` — React components, including `ui/` (shadcn primitives)
- `src/lib/` — data loading (`crsp.js`) and slug helpers (`slug.js`, `utils.js`)
- `src/hooks/`, `src/services/` — unchanged from the pre-Next.js app
- `next.config.mjs` — `serverExternalPackages` + `agentRules: false`
- `components.json` — shadcn/ui configuration
