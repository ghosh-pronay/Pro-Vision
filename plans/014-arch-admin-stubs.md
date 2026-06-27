# Plan 014: Fix admin role check + implement stubs

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- src/components/DashboardLayout.tsx src/lib/store/index.ts src/convex/_generated/api.ts`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

The admin role check in `DashboardLayout.tsx` uses `(user as { role?: string })?.role === "admin"` which always returns `false` because Firebase `User` objects never have a `role` property. The admin sidebar item never shows regardless of the user's actual admin status. Additionally, 23+ store methods are silent no-ops returning empty/zero data.

## Current state

- `src/components/DashboardLayout.tsx:21` — `const isAdmin = (user as { role?: string })?.role === "admin";` (always false)
- `src/lib/store/index.ts:125-141` — `admin.listUsers()` returns `[]`, `getStats()` returns zeros, `grantPremium`/`revokePremium`/`deleteUser` are no-ops
- `src/lib/store/index.ts:160` — `updateRule(): void {}` (no-op)
- `src/lib/store/index.ts:188-193` — `challenges.join`, `leave`, `updateProgress`, `getLeaderboard` are stubs
- `src/lib/store/kanban.ts:19-25` — 7 empty stubs for kanban operations

## Commands you will need

| Purpose   | Command        | Expected on success |
| --------- | -------------- | ------------------- |
| Typecheck | `npx tsc -b`   | exit 0              |
| Lint      | `npm run lint` | exit 0              |
| Test      | `npm test`     | all pass            |

## Scope

**In scope:**

- `src/components/DashboardLayout.tsx` — Fix admin role check to fetch from Firestore
- `src/lib/store/index.ts` — Implement `admin.*` methods and `automation.updateRule`
- `src/lib/store/kanban.ts` — Implement kanban CRUD stubs

**Out of scope:**

- Other stubs (challenges, expenseGroups, etc.) — lower priority
- Real Convex backend deployment

## Steps

### Step 1: Fix admin role check in DashboardLayout.tsx

Replace the `as` cast with a Firestore lookup:

```typescript
import { useEffect, useState } from "react";
import { getDb } from "@/lib/firebase";

export default function DashboardLayout() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkAdmin = async () => {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const db = await getDb();
        const snap = await getDoc(doc(db, "users", user.uid));
        setIsAdmin(snap.data()?.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);
```

**Verify**: `grep -n "as { role" src/components/DashboardLayout.tsx` → no matches

### Step 2: Implement `admin.listUsers()` in store

```typescript
const admin = {
  listUsers(): StoredRecord[] {
    return getStore("users");
  },
  getStats(): Record<string, unknown> {
    const users = getStore("users");
    return {
      totalUsers: users.length,
      premiumUsers: users.filter((u) => u.isPremium).length,
      recentSignups: users.filter((u) => {
        const dayAgo = Date.now() - 86400000;
        return (u.createdAt as number) >= dayAgo;
      }).length,
    };
  },
  grantPremium(userId: string): void {
    const users = getStore("users");
    const index = users.findIndex((u) => u._id === userId);
    if (index !== -1) {
      users[index].isPremium = true;
      setStore("users", users);
    }
  },
  revokePremium(userId: string): void {
    const users = getStore("users");
    const index = users.findIndex((u) => u._id === userId);
    if (index !== -1) {
      users[index].isPremium = false;
      setStore("users", users);
    }
  },
  deleteUser(userId: string): void {
    setStore(
      "users",
      getStore("users").filter((u) => u._id !== userId),
    );
  },
};
```

**Verify**: `grep -n "listUsers" src/lib/store/index.ts` → implementation present

### Step 3: Implement `automation.updateRule()`

```typescript
automation: {
  // ... existing methods
  updateRule(id: string, data: Partial<StoredRecord>): void {
    const rules = getStore("automationRules");
    const index = rules.findIndex((r) => r._id === id);
    if (index !== -1) {
      rules[index] = { ...rules[index], ...data };
      setStore("automationRules", rules);
    }
  },
},
```

**Verify**: `grep -n "updateRule" src/lib/store/index.ts` → implementation present (not empty)

### Step 4: Implement kanban CRUD stubs

```typescript
// In kanban.ts:
updateColumn(id: string, data: Partial<StoredRecord>): void {
  const columns = getStore("kanbanColumns");
  const index = columns.findIndex((c) => c._id === id);
  if (index !== -1) {
    columns[index] = { ...columns[index], ...data };
    setStore("kanbanColumns", columns);
  }
},
deleteColumn(id: string): void {
  setStore("kanbanColumns", getStore("kanbanColumns").filter((c) => c._id !== id));
  // Also delete tasks in this column
  setStore("kanbanTasks", getStore("kanbanTasks").filter((t) => t.columnId !== id));
},
createTask(data: Record<string, unknown>): StoredRecord {
  const tasks = getStore("kanbanTasks");
  const task = { _id: generateId(), createdAt: now(), ...data };
  tasks.push(task);
  setStore("kanbanTasks", tasks);
  return task;
},
// ... implement remaining stubs
```

**Verify**: `grep -c "=> {}" src/lib/store/kanban.ts` → 0 (no empty stubs)

### Step 5: Run verification

```bash
npx tsc -b
npm run lint
npm test
```

All must pass.

## Test plan

- Test `admin.getStats()` returns correct counts
- Test `admin.grantPremium()` sets `isPremium` to `true`
- Test `admin.revokePremium()` sets `isPremium` to `false`
- Test `admin.deleteUser()` removes user from store
- Test `kanban.createTask()` creates a task with correct shape
- Test `kanban.deleteColumn()` removes column and its tasks

## Done criteria

- [ ] `npx tsc -b` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `grep -n "as { role" src/components/DashboardLayout.tsx` → no matches
- [ ] `grep -c "=> {}" src/lib/store/kanban.ts` → 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- Firestore lookup breaks the layout component

## Maintenance notes

- The admin role check now makes an async Firestore call — consider caching the result
- The kanban stubs implement basic CRUD; more complex operations (move task between columns) may need additional logic
- When the real Convex backend is deployed, these implementations will be replaced by Convex functions
- Consider adding a `useAdmin` hook to centralize the admin role check
