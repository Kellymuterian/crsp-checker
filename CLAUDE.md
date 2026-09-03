# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (Vite, http://localhost:5173)
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint
- `npm run preview` — preview the production build

No test suite is configured.

## Architecture

React + Vite SPA that looks up vehicle CRSP data from an Excel file via a serverless API.

```
api/crsp.xlsx (Excel data)
    -> api/search.js (serverless handler, loads + caches sheet in memory, 5-min TTL)
    -> src/services/vehicleApi.js (fetch client for /api/search)
    -> src/hooks/useVehicleSearch.js (debounces 300ms, uses AbortController per keystroke)
    -> src/App.jsx (search input, renders Dropdown + SelectedVehicle)
```

- `api/search.js`: reads `api/crsp.xlsx` with the `xlsx` package (`range: 1` — skips a header row), caches the parsed rows in a module-level variable for 5 minutes, filters case-insensitively on `Make` (required) and `Model` (optional substring match), returns up to 20 results. If `api/crsp.xlsx` is missing, this handler throws.
- `src/hooks/useVehicleSearch.js`: parses the raw query string as `first word = make, rest = model` (e.g. "Toyota Camry" -> make: "toyota", model: "camry"). Aborts the previous in-flight request whenever the query changes or the component unmounts, to avoid out-of-order results.
- Dark mode is persisted to `localStorage` (JSON boolean), defaults to `prefers-color-scheme`, and is applied via Tailwind's `dark:` variant driven off a class on `document.documentElement`.
- Styling is Tailwind CSS v4 via `@tailwindcss/vite` (no separate Tailwind CLI/PostCSS pipeline step needed beyond the Vite plugin).

## Conventions and gotchas

- Search matching is whitespace-sensitive in the query split logic — extra/missing spaces change how make/model are parsed.
- Vehicle field names in components come straight from Excel column headers (e.g. `item.Make`, `item.Model`, `item["Model number"]`), so adding a column requires no server-side mapping — just reference the new key in `src/components/SelectedVehicle.jsx`.
- To add a search filter: extend the filter logic in `api/search.js`, then update the query parsing in `useVehicleSearch.js`, then wire up UI in `App.jsx`.
- Cache TTL in `api/search.js` is the literal `300000` (ms); adjust there if data updates more/less frequently than every 5 minutes.
