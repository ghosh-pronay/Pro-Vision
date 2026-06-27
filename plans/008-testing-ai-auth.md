# Plan 008: Fix AI test mocking + add auth flow tests

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- src/lib/__tests__/ai.test.ts src/hooks/__tests__/use-auth.test.ts`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

The AI integration tests mock everything and only verify the happy path — the critical Gemini→Groq fallback logic (a resilience feature) has zero test coverage. The `useAuth` hook tests skip the `email-otp` and `email-otp-link` sign-in methods entirely, leaving a complete auth flow untested.

## Current state

- `src/lib/__tests__/ai.test.ts:3-8` — Mocks `firebase/functions` and `../firebase` entirely
- `src/lib/__tests__/ai.test.ts:42-61` — Tests verify `mockCallable` was called, not actual behavior
- `src/lib/ai.ts:150-158` — Gemini→Groq fallback logic untested
- `src/hooks/__tests__/use-auth.test.ts` — Tests `password`, `anonymous`, `unsupported` but skips `email-otp` and `email-otp-link`

## Commands you will need

| Purpose       | Command               | Expected on success |
| ------------- | --------------------- | ------------------- |
| Test          | `npm test`            | all pass            |
| Test specific | `npm test -- ai`      | AI tests pass       |
| Test specific | `npm test -- useAuth` | Auth tests pass     |

## Scope

**In scope:**

- `src/lib/__tests__/ai.test.ts` — Add fallback path tests
- `src/hooks/__tests__/use-auth.test.ts` — Add email-otp and email-otp-link tests

**Out of scope:**

- Other test files — handled by other plans
- Mock infrastructure changes

## Steps

### Step 1: Read current AI test file

Read `src/lib/__tests__/ai.test.ts` to understand the current mocking pattern.

**Verify**: File exists and is readable

### Step 2: Add Gemini→Groq fallback test

Add to `src/lib/__tests__/ai.test.ts`:

```typescript
describe("Gemini→Groq fallback", () => {
  it("falls back to Groq when Gemini returns quota error", async () => {
    // Mock geminiProxy to throw quota error
    // Mock groqProxy to return success
    // Call generateGeminiResponse
    // Verify groqProxy was called
  });

  it("throws when both Gemini and Groq fail", async () => {
    // Mock both to throw
    // Verify error is thrown
  });

  it("isQuotaError detects various error formats", () => {
    // Test isQuotaError with:
    // - "429" in message
    // - "quota" in message
    // - "rate limit" in message
    // - "resource exhausted" in message
    // - Non-quota error
  });
});
```

**Verify**: `npm test -- ai` → tests pass, fallback tests present

### Step 3: Read current auth test file

Read `src/hooks/__tests__/use-auth.test.ts` to understand the current pattern.

**Verify**: File exists and is readable

### Step 4: Add email-otp sign-in test

Add to `src/hooks/__tests__/use-auth.test.ts`:

```typescript
describe("email-otp sign-in", () => {
  it("sends sign-in link to email", async () => {
    // Mock sendSignInLinkToEmail
    // Call signIn("email-otp", formData)
    // Verify sendSignInLinkToEmail was called with correct email
    // Verify email was stored in localStorage
  });

  it("throws if email is missing", async () => {
    const formData = new FormData();
    // Don't set email
    // Call signIn("email-otp", formData)
    // Verify error is thrown
  });
});
```

**Verify**: `npm test -- useAuth` → tests pass, email-otp tests present

### Step 5: Add email-otp-link sign-in test

```typescript
describe("email-otp-link sign-in", () => {
  it("signs in with email link when email is in localStorage", async () => {
    // Set emailForSignIn in localStorage
    // Mock signInWithEmailLink
    // Call signIn("email-otp-link")
    // Verify signInWithEmailLink was called
    // Verify emailForSignIn was removed from localStorage
  });

  it("does nothing if email is not in localStorage", async () => {
    // Clear emailForSignIn from localStorage
    // Mock signInWithEmailLink
    // Call signIn("email-otp-link")
    // Verify signInWithEmailLink was NOT called
  });
});
```

**Verify**: `npm test -- useAuth` → tests pass, email-otp-link tests present

### Step 6: Run full test suite

```bash
npm test
```

All tests must pass.

## Test plan

- 5 new test cases for AI fallback logic
- 4 new test cases for email-otp and email-otp-link auth flows
- Tests verify actual behavior, not just mock calls

## Done criteria

- [ ] `npm test` exits 0
- [ ] `grep -n "fallback" src/lib/__tests__/ai.test.ts` → fallback tests present
- [ ] `grep -n "email-otp" src/hooks/__tests__/use-auth.test.ts` → email-otp tests present
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- Mocking `sendSignInLinkToEmail` doesn't work with the test setup

## Maintenance notes

- The AI fallback tests are critical — they verify the resilience feature works
- The email-otp tests cover a complete auth flow that was previously invisible
- When adding new auth methods, add corresponding tests
- Consider using `msw` for more realistic API mocking in the future
