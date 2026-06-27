# Pro-Vision — Agent Context

## Project Overview

All-in-one productivity app for Bangladesh. React 19 + TypeScript + Vite PWA with Firebase Auth, Convex (shimmed to localStorage), and AI Coach (Gemini + Groq).

## Build & Test Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run verify        # Lint + typecheck + test
npm test              # Run tests
npm run lint          # ESLint
npm run typecheck     # TypeScript check
```

## Architecture

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 + Shadcn UI
- **State**: Zustand (global UI) + localStorage (data)
- **Backend**: Firebase Auth + Convex (shimmed) + Cloud Functions
- **AI**: Gemini (primary) + Groq (fallback) via Cloud Function proxy

## Key Files

- `src/App.tsx` — Routes (55+ lazy-loaded pages)
- `src/lib/store/index.ts` — localStorage data store
- `src/convex/react.ts` — Convex shim (useQuery/useMutation)
- `src/lib/ai.ts` — AI integration (via Cloud Function proxies)
- `src/hooks/use-auth.ts` — Firebase auth hook
- `functions/index.js` — Cloud Functions (geminiProxy, groqProxy, sendWelcomeEmail)

## Conventions

- Use Shadcn UI components from `src/components/ui/`
- Follow existing patterns in `src/lib/store/` for new data modules
- All routes are lazy-loaded in `src/App.tsx`
- Use `useI18n()` hook for translations (Bengali/English)
- Use `cn()` utility for className merging
- API keys are server-side only (Cloud Functions)

## Testing

- **Framework**: Vitest with jsdom environment
- **Location**: `src/**/__tests__/*.test.ts(x)`
- **Setup file**: `src/setupTests.ts` (global mocks for matchMedia, clipboard, etc.)
- **Helpers**: `src/test-utils.tsx` provides `renderWithProviders`
- **Coverage thresholds**: Lines 50%, Functions 50%, Branches 40%, Statements 50%
- **Run**: `npm test` (single run), `npm run test:watch` (watch), `npm run test:coverage` (with coverage)
- **CI**: Both workflows run `npm run lint` + `npm run verify` + `npm run test:coverage` + `npm run build`

## Known Gotchas

- Convex shim uses localStorage — data is browser-only
- Groq/Gemini API keys must be server-side (Cloud Functions)
- Admin role is stored in Firestore `users` collection
- FCM tokens stored in localStorage, cleared on sign-out
