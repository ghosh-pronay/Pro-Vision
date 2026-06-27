# Plan 012: Extract store CRUD factory

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- src/lib/store/`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

Every store module (tasks, habits, wallets, transactions, goals, journal, reading, social, wellness, etc.) repeats identical `list()`, `create()`, `remove()`, `update()` implementations using `getStore/setStore/generateId/now`. This is ~20-35 lines of identical boilerplate in 14+ files. Fixing a bug in the CRUD pattern requires editing all 14+ files.

## Current state

- `src/lib/store/tasks.ts:4-18` — CRUD boilerplate
- `src/lib/store/habits.ts:4-18` — Same CRUD boilerplate
- `src/lib/store/wallets.ts:4-18` — Same CRUD boilerplate
- `src/lib/store/transactions.ts:4-18` — Same CRUD boilerplate
- `src/lib/store/goals.ts:4-21` — Same CRUD boilerplate
- `src/lib/store/journal.ts:4-18` — Same CRUD boilerplate
- `src/lib/store/reading.ts:4-18` — Same CRUD boilerplate
- `src/lib/store/social.ts:4-18` — Same CRUD boilerplate
- `src/lib/store/wellness.ts:3-28` — Same CRUD boilerplate
- `src/lib/store/mood.ts:3-13` — Same CRUD boilerplate
- `src/lib/store/focus.ts:3-13` — Same CRUD boilerplate
- `src/lib/store/sleep.ts:3-13` — Same CRUD boilerplate
- `src/lib/store/notifications.ts:3-18` — Same CRUD boilerplate

## Commands you will need

| Purpose   | Command        | Expected on success |
| --------- | -------------- | ------------------- |
| Typecheck | `npx tsc -b`   | exit 0              |
| Lint      | `npm run lint` | exit 0              |
| Test      | `npm test`     | all pass            |

## Scope

**In scope:**

- `src/lib/store/types.ts` — Add `createCollection` factory
- `src/lib/store/tasks.ts` — Refactor to use factory
- `src/lib/store/habits.ts` — Refactor to use factory
- `src/lib/store/wallets.ts` — Refactor to use factory
- `src/lib/store/transactions.ts` — Refactor to use factory
- `src/lib/store/goals.ts` — Refactor to use factory
- `src/lib/store/journal.ts` — Refactor to use factory
- `src/lib/store/reading.ts` — Refactor to use factory
- `src/lib/store/social.ts` — Refactor to use factory
- `src/lib/store/wellness.ts` — Refactor to use factory
- `src/lib/store/mood.ts` — Refactor to use factory
- `src/lib/store/focus.ts` — Refactor to use factory
- `src/lib/store/sleep.ts` — Refactor to use factory
- `src/lib/store/notifications.ts` — Refactor to use factory

**Out of scope:**

- `src/lib/store/finance.ts` — Has complex nested modules, refactor separately
- `src/lib/store/index.ts` — Barrel file, no changes needed

## Steps

### Step 1: Create `createCollection` factory in `types.ts`

Add to `src/lib/store/types.ts`:

```typescript
export interface Collection<T extends StoredRecord> {
  list(): T[];
  create(data: Record<string, unknown>): T;
  remove(id: string): void;
  update(id: string, data: Partial<T>): void;
}

export function createCollection<T extends StoredRecord>(
  key: string,
  options?: { prepend?: boolean },
): Collection<T> {
  return {
    list(): T[] {
      return getStore<T>(key);
    },
    create(data: Record<string, unknown>): T {
      const items = getStore<T>(key);
      const item = { _id: generateId(), createdAt: now(), ...data } as T;
      if (options?.prepend) {
        items.unshift(item);
      } else {
        items.push(item);
      }
      setStore(key, items);
      return item;
    },
    remove(id: string): void {
      setStore(
        key,
        getStore<T>(key).filter((item) => item._id !== id),
      );
    },
    update(id: string, data: Partial<T>): void {
      const items = getStore<T>(key);
      const index = items.findIndex((item) => item._id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...data };
        setStore(key, items);
      }
    },
  };
}
```

**Verify**: `grep -n "createCollection" src/lib/store/types.ts` → function defined

### Step 2: Refactor `tasks.ts` to use factory

```typescript
import { createCollection, type StoredRecord } from "./types";

export interface Task extends StoredRecord {
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  // ... other fields
}

const tasksBase = createCollection<Task>("tasks", { prepend: true });

export const tasks = {
  ...tasksBase,
  // Add domain-specific methods:
  getCompleted(): Task[] {
    return tasksBase.list().filter((t) => t.completed);
  },
  getPending(): Task[] {
    return tasksBase.list().filter((t) => !t.completed);
  },
  // ... other domain methods
};
```

**Verify**: `grep -n "createCollection" src/lib/store/tasks.ts` → factory used

### Step 3: Refactor remaining modules

Apply the same pattern to habits, wallets, transactions, goals, journal, reading, social, wellness, mood, focus, sleep, notifications.

Each module:

1. Import `createCollection` and define a typed interface
2. Replace boilerplate CRUD with factory call
3. Keep domain-specific methods (stats, filters, etc.)

**Verify**: `grep -c "createCollection" src/lib/store/*.ts` → 13+ files using factory

### Step 4: Remove duplicate `wallets_extra` and `transactions_extra`

Delete the `_extra` exports from `wallets.ts` and `transactions.ts` — they're identical to the primary exports with only an ordering difference.

**Verify**: `grep -n "wallets_extra\|transactions_extra" src/lib/store/` → no matches

### Step 5: Run verification

```bash
npx tsc -b
npm run lint
npm test
```

All must pass.

## Test plan

- Verify each refactored module produces identical results to the old implementation
- Test `createCollection` factory directly:
  - `createCollection("test")` returns working `list`, `create`, `remove`, `update`
  - `create` with `prepend: true` adds to front
  - `create` without `prepend` adds to end
  - `remove` deletes by ID
  - `update` merges partial data

## Done criteria

- [ ] `npx tsc -b` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `grep -c "createCollection" src/lib/store/*.ts` → 13+ files
- [ ] `grep -n "wallets_extra\|transactions_extra" src/lib/store/` → no matches
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- The factory doesn't support a domain-specific pattern used by a module

## Maintenance notes

- The factory reduces ~300 lines of duplication to ~50 lines
- Adding a new entity now requires only: define interface + call `createCollection` + add domain methods
- Consider adding validation hooks to the factory (e.g., `beforeCreate`, `beforeUpdate`)
- The `StoredRecord` type should eventually be replaced with proper typed interfaces
