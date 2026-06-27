# Plan 009: Progressive dashboard rendering

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- src/pages/Dashboard.tsx`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

The Dashboard is the most-visited page. It issues 9 parallel `useQuery()` calls and shows a full-page spinner until ALL queries resolve. If any one query is slow (cold cache, large dataset), the entire page is blank. No progressive rendering — users see nothing until the slowest query completes. This is the highest-UX-impact performance issue in the app.

## Current state

- `src/pages/Dashboard.tsx:77-85` — 9 `useQuery()` calls (tasks, habits, transactions, focusSessions, goals, wallets, moods, sleepLogs, profile)
- `src/pages/Dashboard.tsx:87-96` — `isLoading` checks ALL are `undefined`, shows spinner if any is loading

## Commands you will need

| Purpose   | Command         | Expected on success |
| --------- | --------------- | ------------------- |
| Typecheck | `npx tsc -b`    | exit 0              |
| Lint      | `npm run lint`  | exit 0              |
| Test      | `npm test`      | all pass            |
| Build     | `npm run build` | exit 0              |

## Scope

**In scope:**

- `src/pages/Dashboard.tsx` — Replace all-or-nothing loading with per-section rendering

**Out of scope:**

- Other pages — Dashboard is the priority
- Convex query optimization — that's backend work

## Steps

### Step 1: Remove the all-or-nothing `isLoading` gate

Replace the current pattern:

```typescript
const isLoading = !tasks && !habits && !transactions && ...;
if (isLoading) return <LoadingSpinner />;
```

With per-section conditional rendering:

```typescript
// Each section renders independently based on its query result
{tasks ? <TasksSection data={tasks} /> : <SectionSkeleton />}
{habits ? <HabitsSection data={habits} /> : <SectionSkeleton />}
```

**Verify**: `grep -n "isLoading" src/pages/Dashboard.tsx` → no full-page loading gate

### Step 2: Create a `SectionSkeleton` component

Add a lightweight skeleton component for loading states:

```tsx
function SectionSkeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded-lg ${className ?? "h-32"}`}>
      <div className="h-4 bg-muted-foreground/10 rounded w-1/3 m-4" />
      <div className="h-8 bg-muted-foreground/10 rounded w-2/3 m-4" />
    </div>
  );
}
```

**Verify**: `grep -n "SectionSkeleton" src/pages/Dashboard.tsx` → component used

### Step 3: Wrap each dashboard section in its own loading boundary

Group related queries and render them independently:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Tasks section - independent */}
  <div>{tasks ? <TasksCard tasks={tasks} /> : <SectionSkeleton />}</div>

  {/* Habits section - independent */}
  <div>{habits ? <HabitsCard habits={habits} /> : <SectionSkeleton />}</div>

  {/* Transactions section - independent */}
  <div>
    {transactions ? (
      <TransactionsCard transactions={transactions} />
    ) : (
      <SectionSkeleton />
    )}
  </div>

  {/* ... more sections */}
</div>
```

**Verify**: `npm run build` → exit 0, no errors

### Step 4: Add `<Suspense>` boundaries for chart sections

For sections that use heavy components (charts, maps), wrap in `<Suspense>`:

```tsx
<Suspense fallback={<SectionSkeleton />}>
  {focusSessions ? <FocusChart data={focusSessions} /> : <SectionSkeleton />}
</Suspense>
```

**Verify**: `grep -n "Suspense" src/pages/Dashboard.tsx` → at least 1 boundary

### Step 5: Run verification

```bash
npx tsc -b
npm run lint
npm test
npm run build
```

All must pass.

## Test plan

- Update `src/pages/__tests__/Dashboard.test.tsx` to verify:
  - Dashboard renders even when some queries return `undefined`
  - Each section shows skeleton when loading
  - Each section shows content when data arrives

## Done criteria

- [ ] `npx tsc -b` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` exits 0
- [ ] `grep -n "isLoading" src/pages/Dashboard.tsx` → no full-page loading gate
- [ ] `grep -n "SectionSkeleton" src/pages/Dashboard.tsx` → skeleton used
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- Removing the loading gate causes layout shifts or broken UI

## Maintenance notes

- This change improves perceived performance significantly — users see content as it loads
- The skeleton components should match the final layout to minimize layout shift
- Consider adding a `<Suspense>` boundary around the entire dashboard for error isolation
- When adding new dashboard sections, always use the per-section loading pattern
