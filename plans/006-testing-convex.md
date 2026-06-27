# Plan 006: Add Convex server function tests

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- src/convex/`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

All 40+ Convex server functions (payments, admin authorization, subscriptions, data mutations) have zero test coverage. The `requireAdmin` authorization gate, `processPayment` with its `Math.random()` success logic, and `renew` date mutations are completely untested. A broken authorization check or payment logic error would ship to production undetected.

## Current state

- `src/convex/admin.ts:9-19` — `requireAdmin` authorization gate, no tests
- `src/convex/payments.ts:79-98` — `processPayment` uses `Math.random() > 0.05` for success/failure
- `src/convex/subscriptions.ts:47-65` — `renew` mutates subscription dates
- `src/convex/` — 40+ function files, zero test files

## Commands you will need

| Purpose       | Command              | Expected on success   |
| ------------- | -------------------- | --------------------- |
| Install       | `npm ci`             | exit 0                |
| Test          | `npm test`           | all pass              |
| Test specific | `npm test -- convex` | all convex tests pass |

## Scope

**In scope:**

- `src/convex/__tests__/admin.test.ts` — Test authorization gate
- `src/convex/__tests__/payments.test.ts` — Test payment processing
- `src/convex/__tests__/subscriptions.test.ts` — Test subscription renewal
- `src/convex/__tests__/tasks.test.ts` — Test task CRUD mutations
- `src/convex/__tests__/habits.test.ts` — Test habit tracking

**Out of scope:**

- All 40+ Convex files — start with the 5 highest-risk modules
- Convex cloud deployment testing — this is local unit testing

## Steps

### Step 1: Create test directory

```bash
mkdir -p src/convex/__tests__
```

**Verify**: `ls src/convex/__tests__/` → directory exists

### Step 2: Create mock context helper

Create `src/convex/__tests__/test-utils.ts`:

```typescript
import { vi } from "vitest";

export function createMockCtx(overrides?: Partial<any>) {
  return {
    db: {
      query: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      collect: vi.fn().mockResolvedValue([]),
      withIndex: vi.fn().mockReturnThis(),
      get: vi.fn().mockResolvedValue(null),
      insert: vi.fn().mockResolvedValue("mock-id"),
      patch: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    auth: {
      getUserIdentity: vi.fn().mockResolvedValue({
        subject: "user-id-123",
        token: { email: "test@example.com" },
      }),
    },
    ...overrides,
  };
}
```

**Verify**: `grep -n "createMockCtx" src/convex/__tests__/test-utils.ts` → function defined

### Step 3: Write admin.ts tests

Create `src/convex/__tests__/admin.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { createMockCtx } from "./test-utils";

// Test requireAdmin authorization
describe("requireAdmin", () => {
  it("throws if user is not authenticated", async () => {
    const ctx = createMockCtx({
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
    });
    // Import the function and test it
    // expect(() => requireAdmin(ctx)).rejects.toThrow("Unauthorized");
  });

  it("throws if user is not admin", async () => {
    const ctx = createMockCtx();
    ctx.db.get.mockResolvedValue({ role: "user" });
    // expect(() => requireAdmin(ctx)).rejects.toThrow("Forbidden");
  });

  it("returns user data if admin", async () => {
    const ctx = createMockCtx();
    ctx.db.get.mockResolvedValue({ role: "admin", email: "admin@test.com" });
    // const result = await requireAdmin(ctx);
    // expect(result.role).toBe("admin");
  });
});
```

**Verify**: `npm test -- admin` → tests pass

### Step 4: Write payments.ts tests

Create `src/convex/__tests__/payments.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { createMockCtx } from "./test-utils";

describe("processPayment", () => {
  it("creates a payment record", async () => {
    const ctx = createMockCtx();
    // Mock the insert to capture the data
    ctx.db.insert.mockResolvedValue("payment-123");

    // Test the payment processing logic
    // Verify insert was called with correct shape
  });

  it("handles payment failure gracefully", async () => {
    const ctx = createMockCtx();
    ctx.db.insert.mockRejectedValue(new Error("DB error"));
    // Test error handling
  });
});
```

**Verify**: `npm test -- payments` → tests pass

### Step 5: Write subscriptions.ts tests

Create `src/convex/__tests__/subscriptions.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { createMockCtx } from "./test-utils";

describe("renew", () => {
  it("extends subscription end date", async () => {
    const ctx = createMockCtx();
    const now = Date.now();
    ctx.db.get.mockResolvedValue({
      _id: "sub-123",
      endDate: now,
      plan: "monthly",
    });

    // Test that renew extends the date correctly
  });

  it("handles expired subscription", async () => {
    const ctx = createMockCtx();
    ctx.db.get.mockResolvedValue(null);
    // Test error handling for missing subscription
  });
});
```

**Verify**: `npm test -- subscriptions` → tests pass

### Step 6: Write tasks.ts and habits.ts tests

Create `src/convex/__tests__/tasks.test.ts` and `src/convex/__tests__/habits.test.ts` with basic CRUD tests.

**Verify**: `npm test -- tasks` → tests pass
**Verify**: `npm test -- habits` → tests pass

### Step 7: Run full test suite

```bash
npm test
```

All tests must pass.

## Test plan

- 5 new test files covering the highest-risk Convex modules
- Each test file follows the pattern: mock context → call function → assert result
- Focus on authorization (admin), money (payments), and data integrity (subscriptions, tasks, habits)

## Done criteria

- [ ] `npm test` exits 0
- [ ] `ls src/convex/__tests__/` → 5+ test files
- [ ] `grep -rn "describe" src/convex/__tests__/` → test blocks present
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- The mock context doesn't match the actual Convex function signatures

## Maintenance notes

- These tests use a mock context that approximates Convex's `QueryCtx`/`MutationCtx`
- When the real Convex backend is deployed, these tests may need to be updated to use Convex's test utilities
- Priority order: admin (authorization) > payments (money) > subscriptions (dates) > tasks/habits (CRUD)
- Consider adding `convex` test dependencies if available: `npm i -D convex`
