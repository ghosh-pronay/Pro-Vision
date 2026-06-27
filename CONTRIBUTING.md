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
- **Store**: Use `createCollection()` from `src/lib/store/types.ts` for new data modules (note: finance.ts uses manual CRUD for historical reasons)

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
