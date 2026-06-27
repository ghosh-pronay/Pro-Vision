# Plan 002: Add authentication to geminiProxy Cloud Function

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- functions/index.js src/lib/ai.ts`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

The `geminiProxy` Cloud Function accepts any POST request with no authentication. Any unauthenticated client can call it and consume the server-side Gemini API key. The CORS wildcard means any origin can invoke it. This is a HIGH-severity vulnerability — an attacker can exhaust the Gemini quota and deny service to all legitimate users.

## Current state

- `functions/index.js:8-9` — `exports.geminiProxy = onRequest({ cors: true, region: "us-central1" }, async (req, res) => {`
- `functions/index.js:11-14` — Only checks `req.method !== "POST"`, no auth verification
- `functions/index.js:41` — Direct `fetch` to Gemini API with server-side key

## Commands you will need

| Purpose   | Command                       | Expected on success |
| --------- | ----------------------------- | ------------------- |
| Install   | `cd functions && npm install` | exit 0              |
| Typecheck | `npx tsc -b`                  | exit 0              |
| Lint      | `npm run lint`                | exit 0              |

## Scope

**In scope:**

- `functions/index.js` — Add Firebase Admin token verification to `geminiProxy`

**Out of scope:**

- `src/lib/ai.ts` — Client already sends Firebase ID token via `httpsCallable`
- `firebase.json` — No config changes needed

## Steps

### Step 1: Install Firebase Admin in functions directory

```bash
cd functions && npm install
```

**Verify**: `ls functions/node_modules/firebase-admin` → directory exists

### Step 2: Add auth verification middleware to `geminiProxy`

Add after the method check (line 14) and before the API key check (line 16):

```javascript
// Verify Firebase Auth token
const authHeader = req.headers.authorization;
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  res.status(401).json({ error: "Unauthorized — missing or invalid token" });
  return;
}

const idToken = authHeader.split("Bearer ")[1];
try {
  const { getAuth } = require("firebase-admin/auth");
  await getAuth().verifyIdToken(idToken);
} catch (error) {
  res.status(401).json({ error: "Unauthorized — invalid or expired token" });
  return;
}
```

**Verify**: `grep -n "verifyIdToken" functions/index.js` → line with auth check

### Step 3: Add rate limiting (optional but recommended)

Add a simple in-memory rate limit per UID:

```javascript
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(uid) {
  const now = Date.now();
  const record = rateLimits.get(uid) || {
    count: 0,
    resetAt: now + RATE_LIMIT_WINDOW,
  };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + RATE_LIMIT_WINDOW;
  }
  record.count++;
  rateLimits.set(uid, record);
  return record.count <= RATE_LIMIT_MAX;
}
```

Use after token verification:

```javascript
const decoded = await getAuth().verifyIdToken(idToken);
if (!checkRateLimit(decoded.uid)) {
  res.status(429).json({ error: "Rate limit exceeded" });
  return;
}
```

**Verify**: `grep -n "checkRateLimit" functions/index.js` → line with rate limit check

### Step 4: Run verification

```bash
npx tsc -b
npm run lint
```

Both must pass with exit 0.

## Test plan

- Manual test: call `geminiProxy` without auth header → expect 401
- Manual test: call `geminiProxy` with invalid token → expect 401
- Manual test: call `geminiProxy` with valid Firebase ID token → expect 200 with Gemini response
- Automated: add a test in `functions/__tests__/` that mocks `admin.auth().verifyIdToken()` and verifies the middleware

## Done criteria

- [ ] `npx tsc -b` exits 0
- [ ] `npm run lint` exits 0
- [ ] `grep -n "verifyIdToken" functions/index.js` returns a match
- [ ] `grep -n "401" functions/index.js` returns auth error responses
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- Firebase Admin is not installed in `functions/node_modules`

## Maintenance notes

- After deployment, verify with: `curl -X POST https://us-central1-pro-visions.cloudfunctions.net/geminiProxy -H "Content-Type: application/json" -d '{}'` → should return 401
- The `httpsCallable` on the client side already sends the Firebase ID token, so no client changes are needed
- Monitor Cloud Function logs for 401 responses to detect abuse attempts
