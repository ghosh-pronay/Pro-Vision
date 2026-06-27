# Plan 010: Fix array sort/scan anti-patterns

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- src/pages/Dashboard.tsx src/lib/store/transactions.ts src/lib/store/tasks.ts src/lib/store/index.ts`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

Multiple hot paths use O(n log n) sort operations to extract a single item, or make 4+ filter passes over the same array when a single pass would suffice. With hundreds of transactions, habits, or mood entries, this allocates and iterates unnecessarily on every render.

## Current state

- `src/pages/Dashboard.tsx:401` — `[...tasks].sort(...)` to get most recent task
- `src/pages/Dashboard.tsx:416` — `[...focusSessions].sort(...)` to get most recent session
- `src/pages/Dashboard.tsx:431` — `[...transactions].sort(...)` to get most recent transaction
- `src/pages/Dashboard.tsx:447` — `[...moods].sort(...)` to get most recent mood
- `src/pages/Dashboard.tsx:479` — `[...sleepLogs].sort(...)` to get most recent sleep log
- `src/lib/store/transactions.ts:25-51` — 4 separate `.filter()` passes over same array
- `src/lib/store/tasks.ts:35-51` — 4 separate `.filter()` passes over same array
- `src/lib/store/index.ts:108-122` — `mealLogs.stats()` 4 reduce passes

## Commands you will need

| Purpose   | Command        | Expected on success |
| --------- | -------------- | ------------------- |
| Typecheck | `npx tsc -b`   | exit 0              |
| Lint      | `npm run lint` | exit 0              |
| Test      | `npm test`     | all pass            |

## Scope

**In scope:**

- `src/pages/Dashboard.tsx` — Replace sort-to-get-one with single-pass reduce
- `src/lib/store/transactions.ts` — Consolidate 4 filter passes into 1
- `src/lib/store/tasks.ts` — Consolidate 4 filter passes into 1
- `src/lib/store/index.ts` — Fix `mealLogs.stats()` and `apiManagement.getHealth()`

**Out of scope:**

- Other store modules — can be done in follow-up
- Chart rendering optimizations

## Steps

### Step 1: Create a `getMostRecent` utility

Add to `src/lib/utils.ts`:

```typescript
export function getMostRecent<T>(items: T[], key: keyof T): T | undefined {
  if (items.length === 0) return undefined;
  return items.reduce((latest, item) => {
    const latestVal = (latest[key] as number) ?? 0;
    const itemVal = (item[key] as number) ?? 0;
    return itemVal > latestVal ? item : latest;
  });
}
```

**Verify**: `grep -n "getMostRecent" src/lib/utils.ts` → function defined

### Step 2: Replace Dashboard sort patterns

Replace each `[...arr].sort(...)[0]` with `getMostRecent(arr, "createdAt")`:

```typescript
// Before:
const latestTask = [...tasks].sort(
  (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
)[0];

// After:
const latestTask = getMostRecent(tasks, "createdAt");
```

Do this for all 5 instances in Dashboard.tsx.

**Verify**: `grep -c "\.\.\..*\.sort" src/pages/Dashboard.tsx` → 0 matches (all replaced)

### Step 3: Consolidate transactions.stats() into single pass

Replace the 4 filter passes in `src/lib/store/transactions.ts`:

```typescript
// Before:
const income = transactions.filter((t) => t.type === "income");
const expense = transactions.filter((t) => t.type === "expense");
const recentIncome = transactions.filter(
  (t) => t.type === "income" && t.date >= ms,
);
const recentExpense = transactions.filter(
  (t) => t.type === "expense" && t.date >= ms,
);

// After:
let totalIncome = 0;
let totalExpense = 0;
let recentIncomeTotal = 0;
let recentExpenseTotal = 0;

for (const t of transactions) {
  if (t.type === "income") {
    totalIncome += t.amount as number;
    if ((t.date as number) >= ms) recentIncomeTotal += t.amount as number;
  } else if (t.type === "expense") {
    totalExpense += t.amount as number;
    if ((t.date as number) >= ms) recentExpenseTotal += t.amount as number;
  }
}
```

**Verify**: `grep -c "\.filter" src/lib/store/transactions.ts` → reduced from 4 to 0 or 1

### Step 4: Consolidate tasks.stats() into single pass

Apply the same pattern to `src/lib/store/tasks.ts`.

**Verify**: `grep -c "\.filter" src/lib/store/tasks.ts` → reduced from 4 to 0 or 1

### Step 5: Fix mealLogs.stats() in store/index.ts

Apply the same single-pass pattern to `mealLogs.stats()`.

**Verify**: `grep -n "mealLogs.stats" src/lib/store/index.ts` → function uses single pass

### Step 6: Fix getHealth() O(n×m) scan

Replace the nested scan in `apiManagement.getHealth()` with a Map-based approach:

```typescript
// Before:
configs.map((config) => {
  const configLogs = logs.filter(
    (l) => l.endpoint === config.endpoint && l.method === config.method,
  );
  // ...
});

// After:
const logsByEndpoint = new Map<string, StoredRecord[]>();
for (const log of logs) {
  const key = `${log.endpoint}:${log.method}`;
  if (!logsByEndpoint.has(key)) logsByEndpoint.set(key, []);
  logsByEndpoint.get(key)!.push(log);
}

configs.map((config) => {
  const configLogs =
    logsByEndpoint.get(`${config.endpoint}:${config.method}`) || [];
  // ...
});
```

**Verify**: `grep -n "logsByEndpoint" src/lib/store/index.ts` → Map-based approach

### Step 7: Run verification

```bash
npx tsc -b
npm run lint
npm test
```

All must pass.

## Test plan

- Add test for `getMostRecent` utility:
  - `getMostRecent([], "createdAt")` → `undefined`
  - `getMostRecent([{createdAt: 1}, {createdAt: 2}], "createdAt")` → `{createdAt: 2}`
- Verify `transactions.stats()` returns same results with new implementation
- Verify `tasks.stats()` returns same results with new implementation

## Done criteria

- [ ] `npx tsc -b` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `grep -c "\.\.\..*\.sort" src/pages/Dashboard.tsx` → 0
- [ ] `grep -n "getMostRecent" src/lib/utils.ts` → function defined
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- The new implementation produces different results than the old one

## Maintenance notes

- The `getMostRecent` utility should be used everywhere a single "most recent" item is needed
- The single-pass pattern should be the default for any stats function
- Consider adding a `createStats` factory that takes filter predicates and returns aggregated results
- Profile with React DevTools after changes to verify render performance improvement
