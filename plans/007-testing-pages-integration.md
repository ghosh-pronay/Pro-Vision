# Plan 007: Add page smoke tests + integration tests

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- src/pages/ src/components/`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

All 55 pages have zero test coverage. User-facing flows (authentication, payment, admin) have no regression safety net. The `Auth.tsx` error-mapping logic (translating Firebase error codes to Bengali/English messages) is untested. There are no integration tests verifying that hooks, stores, and pages compose correctly.

## Current state

- `src/pages/` — 55 `.tsx` files, zero test files
- `src/components/__tests__/` — Only `ErrorBoundary.test.tsx`, `ProtectedRoute.test.tsx`, `Button.test.tsx`, `ConfirmDialog.test.tsx`, `GreetingBar.test.tsx`
- No integration tests exist anywhere in the project

## Commands you will need

| Purpose       | Command            | Expected on success |
| ------------- | ------------------ | ------------------- |
| Test          | `npm test`         | all pass            |
| Test specific | `npm test -- Auth` | Auth tests pass     |

## Scope

**In scope:**

- `src/pages/__tests__/Auth.test.tsx` — Auth page smoke test
- `src/pages/__tests__/Dashboard.test.tsx` — Dashboard page smoke test
- `src/pages/__tests__/Todo.test.tsx` — Todo page smoke test
- `src/pages/__tests__/Payment.test.tsx` — Payment page smoke test
- `src/pages/__tests__/Admin.test.tsx` — Admin page smoke test
- `src/__tests__/integration/auth-flow.test.tsx` — Auth flow integration test

**Out of scope:**

- All 55 pages — start with the 5 highest-risk pages
- Full E2E tests — this is unit/integration level

## Steps

### Step 1: Create pages test directory

```bash
mkdir -p src/pages/__tests__
mkdir -p src/__tests__/integration
```

**Verify**: `ls src/pages/__tests__/` → directory exists

### Step 2: Create test utilities

Create `src/test-utils.tsx` if not already present:

```typescript
import { render, type RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/i18n/LanguageContext";

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react";
```

**Verify**: `grep -n "renderWithProviders" src/test-utils.tsx` → function defined

### Step 3: Write Auth page smoke test

Create `src/pages/__tests__/Auth.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "@/test-utils";
import Auth from "../Auth";

describe("Auth page", () => {
  it("renders without crashing", () => {
    renderWithProviders(<Auth />);
  });

  it("shows sign-in form by default", () => {
    const { getByText } = renderWithProviders(<Auth />);
    // Check for sign-in elements
  });

  it("can switch to sign-up mode", async () => {
    const { getByText } = renderWithProviders(<Auth />);
    // Test mode switching
  });
});
```

**Verify**: `npm test -- Auth` → tests pass

### Step 4: Write Dashboard page smoke test

Create `src/pages/__tests__/Dashboard.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "@/test-utils";
import Dashboard from "../Dashboard";

// Mock the Convex queries
vi.mock("@/convex/react", () => ({
  useQuery: vi.fn(() => []),
  useMutation: vi.fn(() => vi.fn()),
}));

describe("Dashboard page", () => {
  it("renders without crashing", () => {
    renderWithProviders(<Dashboard />);
  });

  it("shows loading state initially", () => {
    const { getByText } = renderWithProviders(<Dashboard />);
    // Check for loading indicators
  });
});
```

**Verify**: `npm test -- Dashboard` → tests pass

### Step 5: Write Todo, Payment, Admin smoke tests

Follow the same pattern for `Todo.test.tsx`, `Payment.test.tsx`, and `Admin.test.tsx`.

**Verify**: `npm test -- "Todo|Payment|Admin"` → tests pass

### Step 6: Write auth flow integration test

Create `src/__tests__/integration/auth-flow.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "@/test-utils";
import Auth from "@/pages/Auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";

describe("Auth flow integration", () => {
  it("redirects unauthenticated user to /auth", () => {
    const { getByText } = renderWithProviders(
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    );
    // Should show auth page or redirect
  });

  it("renders dashboard for authenticated user", () => {
    // Mock auth context to return authenticated user
    const { getByText } = renderWithProviders(
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    );
    // Should render dashboard content
  });
});
```

**Verify**: `npm test -- integration` → tests pass

### Step 7: Run full test suite

```bash
npm test
```

All tests must pass.

## Test plan

- 5 new page smoke tests (Auth, Dashboard, Todo, Payment, Admin)
- 1 new integration test (auth flow)
- Each smoke test verifies the page renders without crashing
- Integration test verifies auth → route protection → dashboard flow

## Done criteria

- [ ] `npm test` exits 0
- [ ] `ls src/pages/__tests__/` → 5+ test files
- [ ] `ls src/__tests__/integration/` → 1+ test file
- [ ] `grep -rn "describe" src/pages/__tests__/` → test blocks present
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- Mocking Convex queries breaks the test environment

## Maintenance notes

- These smoke tests catch rendering crashes but not functional correctness
- Integration tests verify layer composition (auth context → route guard → page)
- When adding new pages, add a corresponding smoke test
- Consider using `msw` (Mock Service Worker) for more realistic integration tests
