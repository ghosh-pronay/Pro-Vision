# Plan 001: Proxy Groq API through Cloud Function

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- functions/index.js src/lib/ai.ts`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

The Groq API key is embedded in the client-side JavaScript bundle via `VITE_GROQ_API_KEY`. Anyone visiting the site can extract it from the built JS and make unlimited API calls — causing quota exhaustion, billing runaway, or abuse. This is a HIGH-severity security vulnerability that requires immediate remediation.

## Current state

- `src/lib/ai.ts:7` — `const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY ?? "";`
- `src/lib/ai.ts:60-76` — `callGroqDirect()` uses the key in an `Authorization: Bearer` header in a browser `fetch` call
- `functions/index.js` — Only has `geminiProxy`; no Groq proxy exists
- The Groq fallback is triggered in `generateGeminiResponse` when Gemini returns a quota error

## Commands you will need

| Purpose   | Command        | Expected on success |
| --------- | -------------- | ------------------- |
| Install   | `npm ci`       | exit 0              |
| Typecheck | `npx tsc -b`   | exit 0, no errors   |
| Lint      | `npm run lint` | exit 0              |
| Test      | `npm test`     | all pass            |

## Scope

**In scope:**

- `functions/index.js` — Add `groqProxy` Cloud Function
- `src/lib/ai.ts` — Replace `callGroqDirect` with `httpsCallable` to `groqProxy`
- `.env.example` — Remove `VITE_GROQ_API_KEY`, add note about server-side key

**Out of scope:**

- `src/lib/firebase.ts` — No changes needed
- `firebase.json` — Cloud Functions config unchanged

## Steps

### Step 1: Add `groqProxy` Cloud Function to `functions/index.js`

Add a new exported function `groqProxy` that:

1. Accepts POST requests with `{ messages, model, temperature, max_tokens }` body
2. Reads the Groq API key from `functions.config().groq?.api_key || process.env.GROQ_API_KEY`
3. Forwards the request to `https://api.groq.com/openai/v1/chat/completions`
4. Returns the response to the client

```javascript
exports.groqProxy = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const apiKey = functions.config().groq?.api_key || process.env.GROQ_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Groq API key not configured on server" });
      return;
    }

    try {
      const { messages, model, temperature, max_tokens } = req.body;

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model || "llama-3.3-70b-versatile",
            messages,
            temperature: temperature ?? 0.7,
            max_tokens: max_tokens ?? 1024,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        res.status(response.status).json(data);
        return;
      }

      res.json(data);
    } catch (error) {
      console.error("[groqProxy] Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);
```

**Verify**: `grep -n "groqProxy" functions/index.js` → line with `exports.groqProxy`

### Step 2: Replace `callGroqDirect` in `src/lib/ai.ts`

Replace the direct fetch call with a Cloud Function call:

```typescript
async function callGroqProxy(
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; max_tokens?: number },
): Promise<string> {
  const proxyFn = httpsCallable(functions, "groqProxy");
  const result = await proxyFn({
    messages,
    model: GROQ_MODEL,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 1024,
  });
  const data = result.data as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}
```

Update all callers of `callGroqDirect` to use `callGroqProxy` instead.

**Verify**: `grep -rn "callGroqDirect" src/` → no matches (all replaced with `callGroqProxy`)
**Verify**: `grep -rn "VITE_GROQ_API_KEY" src/` → no matches (key removed from client)

### Step 3: Clean up environment variables

1. Remove `VITE_GROQ_API_KEY` from `.env.example`
2. Add a comment in `.env.example` noting that `GROQ_API_KEY` is set server-side via `firebase functions:config:set groq.api_key="YOUR_KEY"`

**Verify**: `grep -n "GROQ" .env.example` → shows only server-side config note

### Step 4: Run verification

```bash
npx tsc -b
npm run lint
npm test
```

All must pass with exit 0.

## Test plan

- The existing `src/lib/__tests__/ai.test.ts` needs to be updated to mock `httpsCallable` returning a Groq proxy response instead of testing direct fetch
- Add a test case for the Groq fallback path: when Gemini throws a quota error and `callGroqProxy` is called
- Add a test case for when Groq proxy also fails (both Gemini and Groq down)

## Done criteria

- [ ] `npx tsc -b` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `grep -rn "VITE_GROQ_API_KEY" src/` returns no matches
- [ ] `grep -rn "callGroqDirect" src/` returns no matches
- [ ] `grep -n "groqProxy" functions/index.js` returns a match
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- The Groq API key is found committed in `.env` or source control (report to user — key needs rotation)

## Maintenance notes

- After deploying, run `firebase functions:config:set groq.api_key="YOUR_GROQ_KEY"` to set the server-side key
- The Groq key in the client bundle is burned — rotate it immediately after deployment
- Monitor Cloud Function logs for `groqProxy` to verify it's working
