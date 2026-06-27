# Plan 013: Fix Convex shim + type safety

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- src/convex/react.ts src/convex/_generated/api.ts src/convex/schema.ts`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: MED
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

The Convex shim has multiple issues: `JSON.stringify` as a useEffect dependency (O(args size) per render), a global `_listeners` set (every mutation triggers re-evaluation of every query), missing unmount cleanup for promises, and the `api.ts` shim uses 40+ `as` casts that defeat TypeScript's type checking.

## Current state

- `src/convex/react.ts:18` — `const _listeners = new Set<() => void>();` (global)
- `src/convex/react.ts:41-43` — `Promise.resolve(result).then(resolved => setData(resolved as T))` (no cancellation)
- `src/convex/react.ts:62-63` — `}, [fn, JSON.stringify(args)])` with eslint-disable
- `src/convex/_generated/api.ts` — 420 lines with `args[0] as Record<string, unknown>` casts throughout

## Commands you will need

| Purpose   | Command        | Expected on success |
| --------- | -------------- | ------------------- |
| Typecheck | `npx tsc -b`   | exit 0              |
| Lint      | `npm run lint` | exit 0              |
| Test      | `npm test`     | all pass            |

## Scope

**In scope:**

- `src/convex/react.ts` — Fix lifecycle issues, replace global listeners, fix dependency tracking
- `src/convex/_generated/api.ts` — Add typed wrappers instead of `as` casts

**Out of scope:**

- `src/convex/schema.ts` — Schema is well-designed, no changes needed
- Real Convex backend deployment

## Steps

### Step 1: Add mounted flag to prevent state updates after unmount

```typescript
useEffect(() => {
  let mounted = true;
  const listener = () => {
    try {
      const result = fnRef.current(argsRef.current);
      Promise.resolve(result).then((resolved) => {
        if (mounted) setData(resolved as T);
      });
    } catch (e) {
      console.error("[Convex shim] Query listener failed:", e);
    }
  };
  // ... rest of effect

  return () => {
    mounted = false;
    _listeners.delete(listener);
  };
}, [fn, JSON.stringify(args)]);
```

**Verify**: `grep -n "mounted" src/convex/react.ts` → cleanup flag present

### Step 2: Replace global listeners with per-query listeners

Replace the global `_listeners` Set with a per-query approach:

```typescript
const queryListeners = new Map<string, Set<() => void>>();

export function notifyDataChange() {
  queryListeners.forEach((listeners) => {
    listeners.forEach((l) => l());
  });
}
```

Or better: use a WeakMap keyed by the query function to scope listeners.

**Verify**: `grep -n "queryListeners\|WeakMap" src/convex/react.ts` → scoped listeners

### Step 3: Replace JSON.stringify with shallow comparison

Create a `useShallowCompare` hook:

```typescript
function useShallowCompare(value: unknown): string {
  const ref = useRef(value);
  const serializedRef = useRef(JSON.stringify(value));

  if (JSON.stringify(value) !== serializedRef.current) {
    ref.current = value;
    serializedRef.current = JSON.stringify(value);
  }

  return serializedRef.current;
}
```

Use in `useQuery`:

```typescript
const argsKey = useShallowCompare(args);
// ...
}, [fn, argsKey]);
```

Remove the eslint-disable comment.

**Verify**: `grep -n "eslint-disable" src/convex/react.ts` → no matches

### Step 4: Add typed wrappers to `api.ts`

Replace the `args[0] as Record<string, unknown>` pattern with typed wrapper functions:

```typescript
// Before:
export const tasks = {
  list: (...args: unknown[]) =>
    localDB.tasks.list(args[0] as Record<string, unknown>),
};

// After:
export const tasks = {
  list: (args?: Record<string, unknown>) => localDB.tasks.list(args),
};
```

This gives TypeScript actual type information without casts.

**Verify**: `grep -c "as Record<string, unknown>" src/convex/_generated/api.ts` → reduced from 40+ to 0

### Step 5: Run verification

```bash
npx tsc -b
npm run lint
npm test
```

All must pass.

## Test plan

- Verify no state updates after unmount (no React warnings)
- Verify mutations trigger only relevant query re-evaluations
- Verify typed wrappers provide proper type checking

## Done criteria

- [ ] `npx tsc -b` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `grep -n "eslint-disable" src/convex/react.ts` → no matches
- [ ] `grep -c "as Record<string, unknown>" src/convex/_generated/api.ts` → 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- Typed wrappers break existing callers

## Maintenance notes

- The shim is a development convenience; the real Convex backend will replace it
- The typed wrappers improve DX but don't provide runtime safety
- When deploying real Convex, remove the Vite aliases in `vite.config.ts`
- Consider adding runtime validation to the typed wrappers for debugging
