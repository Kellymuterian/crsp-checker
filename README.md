# CRSP Vehicle Checker

A Next.js (App Router) app for looking up vehicle CRSP (Current Retail Selling Price) data in Kenya, sourced from an Excel file, with SSR/SSG per-vehicle pages for SEO.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

- `pnpm dev` — start the dev server
- `pnpm build` — production build (pre-renders every vehicle page)
- `pnpm start` — serve the production build
- `pnpm lint` — run ESLint

No test suite is configured.

## How it works

Vehicle data lives in `data/crsp.xlsx` and is loaded/cached in memory (5-minute TTL) by `src/lib/crsp.js`, which is the single source of truth for reading the spreadsheet — both the search API and the server-rendered vehicle pages go through it.

```
data/crsp.xlsx
    -> src/lib/crsp.js (loads + caches the sheet, 5-min TTL)
    -> src/app/api/search/route.js (live search API used by the home page)
    -> src/app/vehicles/[slug]/page.js (SSR/ISR: all trims for a Make+Model)
    -> src/app/vehicles/[slug]/[modelNumber]/page.js (SSG+ISR: one exact trim, SEO metadata + JSON-LD)
    -> src/app/sitemap.js (dynamic sitemap listing every vehicle URL)
```

On the client, `src/components/SearchHome.jsx` debounces input (300ms) and queries `/api/search`; results render in a shadcn `Command` dropdown and link straight to the vehicle's detail page rather than showing an inline preview, keeping results crawlable and shareable.

Vehicle detail pages are statically generated for every row in the spreadsheet at build time and revalidated hourly (ISR), so data changes show up without a redeploy, within that window.

## Updating vehicle data

Replace `data/crsp.xlsx`, keeping the existing header row and column names — field names in components are read directly from the spreadsheet headers. Changes appear within 5 minutes in dev, and within the 1-hour ISR window in production (or immediately after a rebuild).

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + React 19
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) components
- [`xlsx`](https://www.npmjs.com/package/xlsx) for reading the CRSP spreadsheet
- [`next-themes`](https://github.com/pacocoursey/next-themes) for dark mode
- Package manager: **pnpm**

See [AGENTS.md](./AGENTS.md) / [CLAUDE.md](./CLAUDE.md) for detailed architecture notes and conventions.
