# CRSP Checker - Agent Instructions

A React + Vite vehicle search application that helps users find and explore vehicle data from CRSP (Crash Safety and Research Program).

## Quick Start

- **Dev server**: `npm run dev` → http://localhost:5173
- **Build**: `npm run build` (outputs to `dist/`)
- **Lint**: `npm lint`
- **Preview production build**: `npm run preview`

## Architecture

### Data Flow

```
Excel Data (api/crsp.xlsx)
    ↓ [Server loads and caches]
API Endpoint (/api/search)
    ↓ [User enters search]
useVehicleSearch Hook [Debounces 300ms + request caching]
    ↓ [Fetches from vehicleApi]
App.jsx [Renders suggestions + selected vehicle]
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `src/App.jsx` | Main app - search input, dark mode toggle, vehicle display |
| `src/components/Dropdown.jsx` | Dropdown list for search suggestions |
| `src/components/SelectedVehicle.jsx` | Shows selected vehicle + similar vehicles |
| `src/hooks/useVehicleSearch.js` | Custom hook for search with debounce + abort handling |
| `src/hooks/useDebounce.js` | Reusable debounce hook (300ms default) |
| `src/services/vehicleApi.js` | API client for `/api/search` endpoint |
| `api/search.js` | Serverless handler that searches XLSX file |

### Data Source

The application searches vehicle data from `api/crsp.xlsx` (Excel file). 

- **Columns**: Make, Model, Model number, and other vehicle attributes
- **Search**: Case-insensitive filtering on Make + Model
- **Caching**: 5-minute server-side cache to avoid repeated Excel file reads
- **Results**: Returns up to 20 matches; client shows 10 similar vehicles

## Development Conventions

### Search Pattern

The search input is parsed as: first word = Make, remaining words = Model
```javascript
const [make = '', ...modelParts] = query.trim().toLowerCase().split(' ');
const model = modelParts.join(' ');
// e.g., "Toyota Camry" → make: "toyota", model: "camry"
```

### Request Cancellation

The hook uses `AbortController` to cancel in-flight requests when:
- User types a new query (new request supersedes old one)
- Component unmounts

This prevents race conditions when results arrive out of order.

### Dark Mode

- Persisted to localStorage as JSON boolean
- Defaults to system preference via `window.matchMedia('(prefers-color-scheme: dark)')`
- Toggle via button in top-right corner
- Uses Tailwind's `dark:` prefix for styling

### UI Framework

- **Styling**: Tailwind CSS v4 with Vite plugin
- **Components**: Functional React components with hooks
- **Dark mode**: Controlled via `document.documentElement.classList`

## Common Tasks

### Add a new search filter

1. Modify the search API in `api/search.js` to filter additional fields
2. Update `useVehicleSearch.js` to parse the new query parameter
3. Add UI input in `src/App.jsx`

**Example**: Add year filtering
```javascript
// In useVehicleSearch.js
const [make = '', year = '', ...modelParts] = query.split(' ');
const data = await fetchVehicles(make, model, year);
```

### Update vehicle display

- Modify `src/components/SelectedVehicle.jsx` to show additional fields
- Data structure comes from Excel columns (e.g., `item.Make`, `item.Model`, `item["Model number"]`)

### Modify search caching

- Server cache (5 minutes): Adjust `300000` in `api/search.js` 
- If data changes frequently, consider a webhook or watch mechanism

## Common Pitfalls

- **Missing Excel file**: If `api/crsp.xlsx` doesn't exist, the API will crash. Ensure it's in the `api/` folder.
- **Encoding**: Search is case-insensitive but whitespace-sensitive. Users must match spacing (e.g., "Toyota Camry" vs "toyota camry").
- **Large Excel files**: Loading the entire file into memory each time (even with caching) may cause performance issues at scale. Consider SQLite or API pagination if data grows.

## Stack Details

- **React**: v19.1.0 (latest, with improved lifecycle)
- **Vite**: v6.3.5 (fast bundler with HMR)
- **Tailwind**: v4.1.8 (with @tailwindcss/vite plugin for optimized builds)
- **XLSX**: v0.18.5 (Excel file parsing)
- **ESLint**: v9.25.0 (with React + React Hooks plugins)

## File Structure Notes

- `public/` - Static files (Google verification, sitemap)
- `src/` - Frontend React code
- `api/` - Serverless backend function + data
- `index.html` - Vite entry point (don't modify unless needed)
- `vite.config.js` - Vite configuration (plugins: React + Tailwind)
