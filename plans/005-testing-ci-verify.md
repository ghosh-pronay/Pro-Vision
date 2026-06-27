# Plan 005: Add tests to CI + create verify script

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- .github/workflows/ package.json`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

The CI pipeline runs `npm ci` → `npm run build` with no test step. Merges to main are never verified against the test suite. Regressions ship silently. The coverage thresholds in `vitest.config.ts` are enforced only locally. Additionally, there is no single-command way to verify the codebase health — developers must manually run lint, typecheck, and test separately.

## Current state

- `.github/workflows/firebase-hosting-merge.yml:15-16` — `npm ci` then `npm run build`, no test step
- `.github/workflows/firebase-hosting-pull-request.yml` — same gap
- `package.json:6-15` — scripts include `dev`, `build`, `lint`, `format`, `test`, `test:coverage`, `test:watch` but no `verify`
- `vitest.config.ts:30-34` — coverage thresholds defined but not enforced in CI

## Commands you will need

| Purpose   | Command        | Expected on success |
| --------- | -------------- | ------------------- |
| Typecheck | `npx tsc -b`   | exit 0              |
| Lint      | `npm run lint` | exit 0              |
| Test      | `npm test`     | all pass            |

## Scope

**In scope:**

- `.github/workflows/firebase-hosting-merge.yml` — Add test step before build
- `.github/workflows/firebase-hosting-pull-request.yml` — Add test step before build
- `package.json` — Add `verify` script

**Out of scope:**

- `vitest.config.ts` — Coverage thresholds already set, no changes needed
- Test file creation — other plans handle this

## Steps

### Step 1: Add `verify` script to `package.json`

Add to the `scripts` section:

```json
"verify": "npm run lint && npx tsc -b && npm test"
```

**Verify**: `grep -n '"verify"' package.json` → script present

### Step 2: Add test step to merge workflow

In `.github/workflows/firebase-hosting-merge.yml`, add after `npm ci` (line 15) and before `npm run build` (line 16):

```yaml
- run: npm test
- run: npm run build
```

**Verify**: `grep -n "npm test" .github/workflows/firebase-hosting-merge.yml` → line present

### Step 3: Add test step to PR workflow

In `.github/workflows/firebase-hosting-pull-request.yml`, add the same test step before build.

**Verify**: `grep -n "npm test" .github/workflows/firebase-hosting-pull-request.yml` → line present

### Step 4: Add typecheck step to both workflows

After the test step, add:

```yaml
- run: npx tsc -b
```

This ensures TypeScript errors are caught in CI.

**Verify**: `grep -n "tsc" .github/workflows/firebase-hosting-merge.yml` → line present

### Step 5: Run verification

```bash
npx tsc -b
npm run lint
npm test
```

All must pass.

## Test plan

- This plan creates the verification infrastructure; no new test files needed
- Verify the CI YAML is valid: `python -c "import yaml; yaml.safe_load(open('.github/workflows/firebase-hosting-merge.yml'))"` or use an online validator

## Done criteria

- [ ] `npx tsc -b` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `grep -n '"verify"' package.json` returns a match
- [ ] `grep -n "npm test" .github/workflows/firebase-hosting-merge.yml` returns a match
- [ ] `grep -n "npm test" .github/workflows/firebase-hosting-pull-request.yml` returns a match
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- The CI YAML becomes invalid after edits

## Maintenance notes

- The `verify` script runs lint, typecheck, and test sequentially — if any fails, the subsequent commands don't run
- Consider adding `npm run test:coverage` instead of `npm test` in CI to enforce coverage thresholds
- If tests become slow, consider splitting into parallel CI jobs (lint+typecheck in one, tests in another)
