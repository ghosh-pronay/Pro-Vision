# Plan 011: Lazy-load Recharts + route grouping

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- src/components/analytics/ src/App.tsx vite.config.ts`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

Recharts (~200KB minified) is eagerly imported via the analytics barrel export. Every user who visits `/reports` or any tab within it downloads the entire Recharts bundle, even if they only view the Overview or Goals tab (which don't use charts). Additionally, 55 lazy routes with no grouping creates a waterfall on navigation — each route is a separate HTTP request.

## Current state

- `src/components/analytics/index.tsx:5-18` — imports all Recharts components eagerly
- `src/App.tsx:14-71` — 58 lazy imports, each creating its own chunk
- `src/App.tsx:173` — `<Routes key={location.pathname}>` forces full remount on navigation
- `vite.config.ts:38` — `charts: ["recharts"]` chunk exists but is always loaded

## Commands you will need

| Purpose   | Command         | Expected on success |
| --------- | --------------- | ------------------- |
| Typecheck | `npx tsc -b`    | exit 0              |
| Lint      | `npm run lint`  | exit 0              |
| Build     | `npm run build` | exit 0              |

## Scope

**In scope:**

- `src/components/analytics/index.tsx` — Lazy-load chart components
- `src/App.tsx` — Remove `key={location.pathname}`, group routes by domain
- `src/pages/Reports.tsx` — Use lazy imports for chart tabs

**Out of scope:**

- Route-level data prefetching — that's a larger architectural change
- Other barrel exports

## Steps

### Step 1: Lazy-load chart components in analytics barrel

Replace eager imports with lazy:

```typescript
// Before:
import { BarChart, Bar, LineChart, Line, ... } from "recharts";

// After:
import { lazy } from "react";
export const LazyBarChart = lazy(() => import("recharts").then(m => ({ default: m.BarChart })));
export const LazyBar = lazy(() => import("recharts").then(m => ({ default: m.Bar })));
// ... etc
```

Or simpler: lazy-load the entire recharts module in tabs that need it:

```typescript
// In Reports.tsx, for the ChartsTab:
const ChartsTab = lazy(() => import("./ChartsTab"));
```

**Verify**: `grep -n "lazy" src/components/analytics/index.tsx` → lazy imports present

### Step 2: Remove `key={location.pathname}` from Routes

In `src/App.tsx:173`, remove the `key` prop:

```tsx
// Before:
<Routes key={location.pathname}>

// After:
<Routes>
```

This prevents full React tree teardown on every navigation.

**Verify**: `grep -n "key={location.pathname}" src/App.tsx` → no matches

### Step 3: Group related lazy imports

Group routes by domain to reduce chunk count:

```typescript
// Finance routes
const Expense = lazy(() => import("@/pages/Expense"));
const Wallets = lazy(() => import("@/pages/Wallets"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));

// Wellbeing routes
const Habits = lazy(() => import("@/pages/Habits"));
const Focus = lazy(() => import("@/pages/Focus"));
const Sleep = lazy(() => import("@/pages/Sleep"));
```

**Verify**: `grep -c "lazy(" src/App.tsx` → same count (58) but grouped

### Step 4: Add prefetching on hover (optional enhancement)

Add a prefetch utility that loads chunks on hover:

```typescript
function prefetchRoute(path: string) {
  // Trigger the dynamic import to start loading the chunk
  const routeImport = routeMap[path];
  if (routeImport) routeImport();
}
```

Use in navigation components:

```tsx
<Link to="/dashboard" onMouseEnter={() => prefetchRoute("/dashboard")}>
```

**Verify**: `grep -n "prefetchRoute" src/components/layout/` → prefetch usage

### Step 5: Run verification

```bash
npx tsc -b
npm run lint
npm run build
```

Check chunk sizes:

```bash
ls -la dist/assets/*.js | sort -k5 -n
```

Recharts chunk should only load when a chart tab is visited.

## Test plan

- Verify build output shows separate chunks for chart-heavy routes
- Verify navigation between routes doesn't cause full-page re-renders
- Verify charts still render correctly in Reports page

## Done criteria

- [ ] `npx tsc -b` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm run build` exits 0
- [ ] `grep -n "key={location.pathname}" src/App.tsx` → no matches
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- Removing `key` prop causes stale state between routes

## Maintenance notes

- The `key` removal may expose components that relied on full remount for cleanup — test thoroughly
- Lazy-loading charts means users see a brief loading state when switching to chart tabs
- Consider using React Router's `defer`/`Await` for data-dependent loading in the future
- Monitor bundle sizes after changes to verify Recharts is properly code-split
