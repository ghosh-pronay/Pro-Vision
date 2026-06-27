# Plan 004: Remove Gemini key from client + FCM token cleanup

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- src/lib/ai.ts src/lib/firebase.ts src/hooks/use-auth.ts .env.example`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

The Gemini API key is bundled into client-side JavaScript via `VITE_GEMINI_API_KEY`. While currently only used for a boolean check (`isGeminiConfigured()`), possession of the key could allow abuse if Gemini's API accepts direct key auth. Additionally, FCM tokens are stored in localStorage without expiry or sign-out cleanup, creating a stale token persistence risk.

## Current state

- `src/lib/ai.ts:6` — `const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";`
- `src/lib/ai.ts:226` — `isGeminiConfigured()` returns `GEMINI_API_KEY.length > 0`
- `src/lib/firebase.ts:125` — `localStorage.setItem("pv-fcm-token", currentToken)`
- `src/lib/firebase.ts:153` — `localStorage.getItem("pv-fcm-token")`
- `src/hooks/use-auth.ts:171-173` — `signOut` only calls `firebaseSignOut(auth)`, no localStorage cleanup

## Commands you will need

| Purpose   | Command        | Expected on success |
| --------- | -------------- | ------------------- |
| Typecheck | `npx tsc -b`   | exit 0              |
| Lint      | `npm run lint` | exit 0              |
| Test      | `npm test`     | all pass            |

## Scope

**In scope:**

- `src/lib/ai.ts` — Remove `VITE_GEMINI_API_KEY`, make `isGeminiConfigured` check server-side or remove
- `src/hooks/use-auth.ts` — Clean up FCM token and localStorage on sign-out
- `.env.example` — Remove `VITE_GEMINI_API_KEY`

**Out of scope:**

- `functions/index.js` — Gemini key is correctly server-side only
- Cloud Function deployment config

## Steps

### Step 1: Remove Gemini key from client in `src/lib/ai.ts`

1. Delete line 6: `const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";`
2. Replace `isGeminiConfigured()` to always return `true` (the Cloud Function handles key availability):

```typescript
export function isGeminiConfigured(): boolean {
  return true;
}
```

Or better: remove the function entirely and have callers assume Gemini is available (the proxy returns an error if not configured).

**Verify**: `grep -rn "VITE_GEMINI_API_KEY" src/` → no matches

### Step 2: Remove from `.env.example`

Delete the line:

```
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**Verify**: `grep -n "GEMINI" .env.example` → no matches

### Step 3: Clean up FCM token on sign-out in `src/hooks/use-auth.ts`

Update the `signOut` callback to clear FCM token:

```typescript
const signOut = useCallback(async () => {
  localStorage.removeItem("pv-fcm-token");
  return firebaseSignOut(auth);
}, []);
```

**Verify**: `grep -n "pv-fcm-token" src/hooks/use-auth.ts` → line with removal

### Step 4: Add FCM token cleanup on auth state change

In the `onAuthStateChanged` callback in `src/hooks/use-auth.ts`, when `firebaseUser` is `null` (user signed out), also clean up:

```typescript
if (!firebaseUser) {
  localStorage.removeItem("pv-fcm-token");
}
```

**Verify**: `grep -c "pv-fcm-token" src/hooks/use-auth.ts` → 2 matches (signOut + onAuthStateChanged)

### Step 5: Update CI workflow

In `.github/workflows/firebase-hosting-merge.yml`, remove the `VITE_GEMINI_API_KEY` env var from the build step (line 26):

```yaml
# Remove this line:
VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
```

Keep the `GOOGLE_APPLICATION_CREDENTIALS` line that sets it server-side.

**Verify**: `grep -n "VITE_GEMINI_API_KEY" .github/workflows/firebase-hosting-merge.yml` → no matches in build step

### Step 6: Run verification

```bash
npx tsc -b
npm run lint
npm test
```

All must pass.

## Test plan

- Update `src/lib/__tests__/ai.test.ts`: remove any tests that check `isGeminiConfigured()` with env vars
- Add test: `isGeminiConfigured()` returns `true`
- Add test: `signOut` clears `pv-fcm-token` from localStorage

## Done criteria

- [ ] `npx tsc -b` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `grep -rn "VITE_GEMINI_API_KEY" src/` returns no matches
- [ ] `grep -n "pv-fcm-token" src/hooks/use-auth.ts` returns 2 matches (cleanup calls)
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- Removing `isGeminiConfigured` breaks callers that depend on it

## Maintenance notes

- The Gemini key in the client bundle is burned — rotate it if it was ever committed to source control
- The `isGeminiConfigured` removal means the UI should always show the AI Coach button; errors from the Cloud Function will indicate if Gemini is not configured
- FCM token cleanup prevents stale tokens from persisting across sessions
