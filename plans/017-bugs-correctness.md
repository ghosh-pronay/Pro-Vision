# Plan 017: Fix correctness bugs — listener leak, race conditions, bounds

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- src/lib/firebase.ts src/convex/react.ts src/lib/store/index.ts src/hooks/use-auth.ts src/components/AdminPortal.tsx src/pages/Admin.tsx`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

Multiple correctness bugs: `onMessageListener` never returns an unsubscribe function (permanent listener leak), `useQuery` in Convex shim can set state after unmount, `Math.max()` on potentially large arrays can crash, `email-otp-link` silently exits if localStorage key is missing, and `AdminPortal` routes lack error boundaries.

## Current state

- `src/lib/firebase.ts:135-149` — `fm.onMessage(m, callback)` no unsubscribe returned
- `src/convex/react.ts:41-43` — `Promise.resolve(result).then(resolved => setData(resolved))` no unmount guard
- `src/convex/react.ts:32-35` — refs updated in separate effect with no dependency guarantee
- `src/lib/store/index.ts:644-646` — `Math.max(...logs.map(...))` can crash on large arrays
- `src/hooks/use-auth.ts:101-111` — `email-otp-link` silently returns if localStorage key missing
- `src/pages/Admin.tsx:56` — `const NOW = Date.now()` at module scope (frozen timestamp)

## Commands you will need

| Purpose   | Command        | Expected on success |
| --------- | -------------- | ------------------- |
| Typecheck | `npx tsc -b`   | exit 0              |
| Lint      | `npm run lint` | exit 0              |
| Test      | `npm test`     | all pass            |

## Scope

**In scope:**

- `src/lib/firebase.ts` — Fix `onMessageListener` to return unsubscribe
- `src/convex/react.ts` — Add mounted flag, fix ref updates
- `src/lib/store/index.ts` — Fix `Math.max` overflow
- `src/hooks/use-auth.ts` — Add error for missing email link
- `src/pages/Admin.tsx` — Move `NOW` inside component

**Out of scope:**

- Other store modules
- Other hooks

## Steps

### Step 1: Fix `onMessageListener` to return unsubscribe

In `src/lib/firebase.ts`, update `onMessageListener`:

```typescript
export function onMessageListener(
  callback: (payload: any) => void,
): () => void {
  const m = getMessaging(app);
  return onMessage(m, callback);
}
```

Update `src/hooks/use-push-notifications.ts` to use the returned unsubscribe function:

```typescript
useEffect(() => {
  const unsubscribe = onMessageListener((payload) => {
    // handle notification
  });
  return () => unsubscribe();
}, []);
```

**Verify**: `grep -n "return onMessage" src/lib/firebase.ts` → returns unsubscribe

### Step 2: Add mounted flag to Convex shim `useQuery`

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
  // ...
  return () => {
    mounted = false;
    _listeners.delete(listener);
  };
}, [fn, JSON.stringify(args)]);
```

**Verify**: `grep -n "mounted" src/convex/react.ts` → cleanup flag present

### Step 3: Fix refs in Convex shim

Replace the separate ref-updating effect with direct closure usage:

```typescript
useEffect(() => {
  let mounted = true;
  const listener = () => {
    try {
      // Use fn and args directly from closure, not from refs
      const result = fn(args);
      Promise.resolve(result).then((resolved) => {
        if (mounted) setData(resolved as T);
      });
    } catch (e) {
      console.error("[Convex shim] Query listener failed:", e);
    }
  };
  _listeners.add(listener);

  // Initial query
  try {
    const result = fn(args);
    Promise.resolve(result).then((resolved) => {
      if (mounted) setData(resolved as T);
    });
  } catch (e) {
    console.error("[Convex shim] Initial query failed:", e);
  }

  return () => {
    mounted = false;
    _listeners.delete(listener);
  };
}, [fn, JSON.stringify(args)]);
```

Remove the first `useEffect` that updates refs.

**Verify**: `grep -c "useEffect" src/convex/react.ts` → reduced from 3 to 2

### Step 4: Fix `Math.max` overflow in store

In `src/lib/store/index.ts`, replace:

```typescript
// Before:
Math.max(...logs.map((l) => l.timestamp as number));

// After:
logs.reduce((max, l) => Math.max(max, (l.timestamp as number) || 0), 0);
```

**Verify**: `grep -n "Math.max.*\.\.\." src/lib/store/index.ts` → no matches (all replaced)

### Step 5: Add error for missing email link

In `src/hooks/use-auth.ts`:

```typescript
if (method === "email-otp-link") {
  const email = window.localStorage.getItem("emailForSignIn");
  if (!email) {
    throw new Error(
      "Email link expired or invalid. Please request a new link.",
    );
  }
  await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem("emailForSignIn");
  return;
}
```

**Verify**: `grep -n "Email link expired" src/hooks/use-auth.ts` → error message present

### Step 6: Move `NOW` inside Admin component

In `src/pages/Admin.tsx`, move `const NOW = Date.now()` inside the component function body so it's evaluated per render.

**Verify**: `grep -n "^const NOW" src/pages/Admin.tsx` → no module-scope constant

### Step 7: Run verification

```bash
npx tsc -b
npm run lint
npm test
```

All must pass.

## Test plan

- Test `onMessageListener` returns a function
- Test `useQuery` doesn't update state after unmount
- Test `email-otp-link` throws when localStorage key missing
- Test `Math.max` replacement handles empty arrays

## Done criteria

- [ ] `npx tsc -b` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `grep -n "return onMessage" src/lib/firebase.ts` → returns unsubscribe
- [ ] `grep -n "mounted" src/convex/react.ts` → cleanup flag present
- [ ] `grep -n "Email link expired" src/hooks/use-auth.ts` → error present
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- Fixing one bug breaks another component

## Maintenance notes

- The `onMessageListener` fix ensures notifications don't stack up
- The Convex shim fixes prevent stale data and memory leaks
- The email link error provides user feedback instead of silent failure
- Consider adding a global error boundary for unhandled promise rejections
