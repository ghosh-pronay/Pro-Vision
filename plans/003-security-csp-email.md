# Plan 003: Add CSP headers + HTML escape email template

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- index.html functions/index.js`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

Two medium-severity security gaps: (1) No Content-Security-Policy headers means any XSS vulnerability has no secondary defense — inline scripts, eval, and third-party script injection are unrestricted. (2) The welcome email template interpolates unescaped user data (`${name}` from email prefix) which allows HTML injection in email clients.

## Current state

- `index.html` — No `<meta http-equiv="Content-Security-Policy">` tag
- `functions/index.js:95` — `Hi ${name},` where `name = after.email.split("@")[0]` (line 81), no HTML escaping
- `functions/index.js:87-119` — Full HTML email template with direct string interpolation

## Commands you will need

| Purpose   | Command         | Expected on success   |
| --------- | --------------- | --------------------- |
| Build     | `npm run build` | exit 0, dist/ created |
| Typecheck | `npx tsc -b`    | exit 0                |

## Scope

**In scope:**

- `index.html` — Add CSP meta tag
- `functions/index.js` — Add HTML escaping for email template variables

**Out of scope:**

- Server-level CSP headers (Firebase Hosting doesn't support custom headers directly; use meta tag)
- Other email templates (only the welcome email exists)

## Steps

### Step 1: Add HTML escape helper to `functions/index.js`

Add at the top of the file (after `initializeApp()`):

```javascript
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

**Verify**: `grep -n "escapeHtml" functions/index.js` → function definition

### Step 2: Apply escapeHtml to email template

Change line 95 from:

```javascript
<h2 style="margin-top: 0; color: #1e293b;">Hi ${name},</h2>
```

to:

```javascript
<h2 style="margin-top: 0; color: #1e293b;">Hi ${escapeHtml(name)},</h2>
```

**Verify**: `grep -n "escapeHtml(name)" functions/index.js` → escaped interpolation

### Step 3: Add CSP meta tag to `index.html`

Add inside `<head>` section (after the existing meta tags, before `<title>`):

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.onesignal.com https://js.playground.vly.ai; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com https://*.cloudfunctions.net https://api.groq.com https://onesignal.com wss://*.onesignal.com; frame-src 'self' https://*.onesignal.com;"
/>
```

This CSP allows:

- Scripts from self, inline (for OneSignal), and specific third-party CDN
- Styles from self and inline (for Tailwind)
- Fonts from Google Fonts
- Images from self, data URIs, and HTTPS
- Connections to Firebase, Google APIs, Groq API, and OneSignal
- Frames from OneSignal

**Verify**: `grep -n "Content-Security-Policy" index.html` → CSP meta tag present

### Step 4: Test the CSP doesn't break functionality

Run the dev server and verify:

1. Page loads without console CSP errors
2. Firebase Auth works (sign in/out)
3. OneSignal loads (check for push notification prompt)
4. AI Coach works (Groq API calls succeed)
5. Google Fonts load (Bengali fonts)

**Verify**: `npm run build` → exit 0, no errors

### Step 5: Run full verification

```bash
npx tsc -b
npm run build
```

Both must pass.

## Test plan

- Add a unit test for `escapeHtml` function:
  - `escapeHtml("<script>alert('xss')</script>")` → `&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;`
  - `escapeHtml('He said "hello"')` → `He said &quot;hello&quot;`
  - `escapeHtml("normal text")` → `normal text`
  - `escapeHtml(null)` → `""`
  - `escapeHtml(undefined)` → `""`

## Done criteria

- [ ] `npx tsc -b` exits 0
- [ ] `npm run build` exits 0
- [ ] `grep -n "escapeHtml" functions/index.js` returns function definition
- [ ] `grep -n "Content-Security-Policy" index.html` returns CSP meta tag
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- CSP breaks existing functionality (OneSignal, Firebase, fonts)

## Maintenance notes

- If new third-party scripts are added (analytics, chat widgets), they must be added to the CSP
- The `unsafe-inline` for scripts is required by OneSignal; ideally replace with nonce-based CSP later
- Monitor browser console for CSP violation reports after deployment
- The `escapeHtml` function should be used for ALL user-derived content in emails, not just the name
