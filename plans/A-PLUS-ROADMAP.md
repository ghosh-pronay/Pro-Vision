# Pro-Vision A+ Roadmap

**Goal**: Achieve A+ grade across all project dimensions
**Timeline**: 4 weeks (20 working days)
**Prerequisites**: Focus on type safety and testing first (highest impact)

---

## Week 1: Foundation (Type Safety + Testing Setup)

### Day 1-2: Shared Types

- [ ] Create `src/types/index.ts` with all shared interfaces
- [ ] Define types for: Task, Habit, Transaction, FocusSession, Goal, Wallet, Mood, SleepLog, UserProfile
- [ ] Export types from `src/types/`
- [ ] Update `src/lib/store/types.ts` to use shared types

### Day 3-4: Type Safety - High Traffic Files

- [ ] Fix `src/pages/use-dashboard-stats.ts` (done - verify)
- [ ] Fix `src/pages/Dashboard.tsx` - replace 20+ `any` types
- [ ] Fix `src/pages/Habits.tsx` - replace 25+ `any` types
- [ ] Fix `src/pages/Wellbeing.tsx` - replace 12+ `any` types
- [ ] Fix `src/pages/Challenges.tsx` - replace 12+ `any` types

### Day 5: Type Safety - Remaining Pages

- [ ] Fix `src/pages/Admin.tsx` - replace 11+ `any` types
- [ ] Fix `src/pages/Goals.tsx` - replace 4+ `any` types
- [ ] Fix `src/pages/Expense.tsx` - replace 3+ `any` types
- [ ] Fix `src/components/coach/CoachFloating.tsx` - replace 10+ `any` types
- [ ] Fix `src/convex/paymentMethods.ts` - replace 12+ `any` types
- [ ] Fix `src/convex/recurringTransactions.ts` - replace 7+ `any` types

### Day 6: Testing Infrastructure

- [ ] Add Playwright for E2E testing
- [ ] Configure Playwright in `playwright.config.ts`
- [ ] Create test utilities in `src/test-utils.tsx` (expand existing)
- [ ] Add Firebase emulator setup for integration tests

### Day 7: Testing - Unit Tests

- [ ] Add tests for `src/lib/store/` modules (tasks, habits, wallets, transactions)
- [ ] Add tests for `src/hooks/` (use-auth, use-i18n, use-keyboard-shortcuts)
- [ ] Add tests for `src/lib/` utilities (ai.ts, input-sanitizer.ts, categories.ts)
- [ ] Target: 80% coverage for lib/ and hooks/

### Day 8: Testing - Component Tests

- [ ] Add tests for `src/components/layout/` (Sidebar, TopBar, BottomNav)
- [ ] Add tests for `src/components/ui/` (Button, Card, Input, Dialog)
- [ ] Add tests for `src/components/ProtectedRoute.tsx`
- [ ] Add tests for `src/components/ErrorBoundary.tsx`

### Day 9: Testing - Page Tests

- [ ] Add tests for `src/pages/Dashboard.tsx`
- [ ] Add tests for `src/pages/Todo.tsx`
- [ ] Add tests for `src/pages/Habits.tsx`
- [ ] Add tests for `src/pages/Expense.tsx`
- [ ] Add tests for `src/pages/Focus.tsx`

### Day 10: Testing - Integration Tests

- [ ] Add integration test for auth flow (sign up → email verify → login)
- [ ] Add integration test for data CRUD (create task → edit → delete)
- [ ] Add integration test for AI coach (send message → receive response)
- [ ] Add integration test for navigation (sidebar clicks → page loads)

---

## Week 2: Quality (Error Handling + Logging + Performance)

### Day 11: Logging Service

- [ ] Add Sentry for error tracking (`@sentry/react`)
- [ ] Configure Sentry in `src/lib/sentry.ts`
- [ ] Add Sentry to `src/main.tsx`
- [ ] Create `src/lib/logger.ts` wrapper (replace console.error)

### Day 12: Error Handling

- [ ] Replace 80+ `console.error` with `logger.error()`
- [ ] Add error boundaries to all route sections
- [ ] Add toast notifications for silent failures
- [ ] Add retry logic for failed API calls

### Day 13: ESLint Warnings

- [ ] Fix `react-refresh/only-export-components` warnings (11)
- [ ] Fix remaining `react-hooks/exhaustive-deps` warnings (10)
- [ ] Fix `@typescript-eslint/no-explicit-any` in remaining files
- [ ] Remove unused `eslint-disable` comments

### Day 14: Performance - Bundle Analysis

- [ ] Add `rollup-plugin-visualizer` to analyze bundle
- [ ] Identify and split large chunks
- [ ] Consider lighter alternatives to `framer-motion` (e.g., `motion` from `framer-motion/m`)
- [ ] Add dynamic imports for heavy components

### Day 15: Performance - Runtime

- [ ] Add `React.memo()` to expensive components
- [ ] Implement virtual scrolling for large lists
- [ ] Add `useDeferredValue` for search inputs
- [ ] Optimize re-renders with `React.memo` and `useCallback`

---

## Week 3: Accessibility + Backend Migration

### Day 16: Accessibility Audit

- [ ] Add `aria-label` to all interactive elements
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Verify color contrast ratios (WCAG AA)
- [ ] Add keyboard navigation for modals/dropdowns

### Day 17: Accessibility Fixes

- [ ] Fix focus management in modals
- [ ] Add skip links to all pages
- [ ] Test with `prefers-reduced-motion`
- [ ] Add `role` attributes where needed

### Day 18: Backend Migration - Setup

- [ ] Set up real Convex backend (project in Convex dashboard)
- [ ] Create Convex schema (migrate from `src/convex/schema.ts`)
- [ ] Set up Convex functions for all collections
- [ ] Test with development data

### Day 19: Backend Migration - Data

- [ ] Create data migration script (localStorage → Convex)
- [ ] Add migration UI for existing users
- [ ] Test migration with sample data
- [ ] Add rollback mechanism

### Day 20: Backend Migration - Integration

- [ ] Replace Convex shim with real Convex client
- [ ] Update all `useQuery`/`useMutation` calls
- [ ] Test offline → online sync
- [ ] Test multi-device sync

---

## Week 4: Production Hardening

### Day 21: CI/CD

- [ ] Add `npm audit` to CI pipeline
- [ ] Add Lighthouse CI for performance budgets
- [ ] Pin GitHub Actions to SHA hashes
- [ ] Add branch protection rules

### Day 22: Monitoring

- [ ] Add error tracking dashboard (Sentry)
- [ ] Add analytics (Plausible/Umami)
- [ ] Add uptime monitoring
- [ ] Add performance metrics collection

### Day 23: Documentation

- [ ] Add JSDoc to public functions
- [ ] Create Storybook for component documentation
- [ ] Update README with setup instructions
- [ ] Add CONTRIBUTING.md guidelines

### Day 24: Code Quality

- [ ] Remove all `console.log` statements
- [ ] Add commit message validation (commitlint)
- [ ] Add pre-push hook (run tests)
- [ ] Clean up unused imports

### Day 25: Final Testing

- [ ] Run full test suite (unit + integration + E2E)
- [ ] Verify 80%+ coverage
- [ ] Test on multiple devices (mobile, tablet, desktop)
- [ ] Test offline functionality
- [ ] Performance audit (Lighthouse 90+)

---

## Success Criteria

### Type Safety (A)

- [ ] 0 `any` types in production code
- [ ] All interfaces exported from `src/types/`
- [ ] TypeScript strict mode enabled

### Testing (A)

- [ ] 80%+ code coverage
- [ ] 100+ test files
- [ ] E2E tests for critical paths
- [ ] Integration tests for auth, data, AI

### Error Handling (A)

- [ ] 0 `console.error` in production
- [ ] Sentry integrated
- [ ] Error boundaries on all routes
- [ ] Toast notifications for failures

### Performance (A)

- [ ] Lighthouse score 90+
- [ ] Bundle size < 500KB (gzipped)
- [ ] Virtual scrolling for large lists
- [ ] Memoized expensive components

### Accessibility (A)

- [ ] WCAG AA compliant
- [ ] Screen reader tested
- [ ] Keyboard navigable
- [ ] Color contrast verified

### Backend (A)

- [ ] Real Convex backend
- [ ] Multi-device sync
- [ ] Data migration complete
- [ ] Offline → online sync

### CI/CD (A)

- [ ] Automated testing
- [ ] Security scanning
- [ ] Performance budgets
- [ ] Branch protection

### Monitoring (A)

- [ ] Error tracking
- [ ] Analytics
- [ ] Uptime monitoring
- [ ] Performance metrics

---

## Dependencies

```
Week 1 (Foundation)
    ↓
Week 2 (Quality) ← depends on types being correct
    ↓
Week 3 (A11y + Backend) ← depends on error handling
    ↓
Week 4 (Hardening) ← depends on everything above
```

---

## Risk Mitigation

| Risk                            | Impact | Mitigation                                |
| ------------------------------- | ------ | ----------------------------------------- |
| Backend migration breaks data   | High   | Test with sample data first, add rollback |
| Performance regression          | Medium | Add Lighthouse CI, monitor bundle size    |
| Accessibility issues found late | Medium | Test early, test often                    |
| Scope creep                     | High   | Stick to roadmap, defer nice-to-haves     |

---

## Notes

- **Focus on type safety first** — catches bugs at compile time
- **Testing is foundational** — everything else builds on it
- **Backend migration is optional** — only if multi-device sync is required
- **Accessibility is non-negotiable** — required for WCAG compliance
- **Performance is user experience** — directly impacts retention

---

**Last Updated**: 2026-07-12
**Status**: Ready to execute
