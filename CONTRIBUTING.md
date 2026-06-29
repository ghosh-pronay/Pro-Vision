# Contributing to Pro-Vision

Thank you for your interest in contributing! Here's how to get started.

## Development Setup

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run verify       # Lint + typecheck + test (run before committing)
```

## Project Structure

```
src/
  pages/          # 55+ route pages (lazy-loaded)
  components/     # Reusable UI components (Shadcn-based)
  lib/
    store/        # localStorage data layer (use createCollection for new modules)
    ai.ts         # AI integration (via Cloud Function proxies)
  convex/         # Convex shim (useQuery/useMutation backed by localStorage)
  hooks/          # Custom React hooks
  contexts/       # React context providers
  i18n/           # Translations (Bengali/English)
functions/        # Firebase Cloud Functions
```

## Coding Conventions

- **Components**: Use Shadcn UI from `src/components/ui/`
- **Styling**: Tailwind CSS v4, use `cn()` utility for className merging
- **i18n**: Use `useI18n()` hook for translations (Bengali/English)
- **State**: Zustand for global UI state, localStorage for data persistence
- **Routes**: All pages lazy-loaded in `src/App.tsx`
- **Store**: Use `createCollection()` from `src/lib/store/types.ts` for new data modules. Note: `index.ts` and `finance.ts` contain ~10 modules with manual CRUD — these are legacy and should be migrated to `createCollection` over time. All new modules must use `createCollection` in separate files.

## Convex Shim Architecture

All `convex/*` imports resolve to local shims via Vite aliases:

- `convex/react` → `src/convex/react.ts` (useQuery, useMutation)
- `convex/_generated/api` → `src/convex/_generated/api.ts` (API routes)
- `convex/values` → `src/convex/shims/values.ts` (validators)
- `convex/server` → `src/convex/shims/server.ts` (server stubs)

**Key rules:**

- Never import directly from `src/lib/store` in components — use the Convex shim interface
- `useQuery(fn)` runs `fn` against localStorage and re-runs when data changes
- `useMutation(fn, collectionKey)` runs `fn`, then notifies listeners for that collection
- Always pass `collectionKey` to `useMutation` for efficient reactivity
- The shim logs an error in production — this is expected until real Convex is deployed

## Testing

```bash
npm test                     # Run all tests
npm run test:watch           # Watch mode
npm run test:coverage        # With coverage report
```

- Test files go in `src/**/__tests__/*.test.ts(x)`
- Use `vitest` + `jsdom` environment
- Use `renderWithProviders` from `src/test-utils.tsx` for component tests
- Run `npm run verify` before pushing (lint + typecheck + test)

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the conventions above
3. Run `npm run verify` to ensure everything passes
4. Open a PR with a clear description of what changed and why

## Commit Messages

Use conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`

## Architecture Decisions

- Convex is shimmed to localStorage for development. Real Convex backend is planned.
- API keys are server-side only (Cloud Functions). Never expose keys in client code.
- Admin role is stored in Firestore `users` collection with `role: "admin"`.
