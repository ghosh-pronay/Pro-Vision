# Plan 015: Add typecheck, pre-commit hooks, editorconfig

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- package.json .editorconfig .husky/`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

There is no `typecheck` script, no pre-commit hooks, and no `.editorconfig`. TypeScript errors are only caught at build time. Code with lint errors or formatting drift lands on `main` without阻拦. Contributors using different editors may introduce inconsistent whitespace.

## Current state

- `package.json:6-15` — No `typecheck` script
- No `.husky/` directory
- No `lint-staged` config
- No `.editorconfig` file
- `.prettierrc` is `{}` (empty defaults)

## Commands you will need

| Purpose   | Command        | Expected on success |
| --------- | -------------- | ------------------- |
| Install   | `npm ci`       | exit 0              |
| Typecheck | `npx tsc -b`   | exit 0              |
| Lint      | `npm run lint` | exit 0              |

## Scope

**In scope:**

- `package.json` — Add `typecheck` script, add husky + lint-staged config
- `.editorconfig` — Create with standard defaults
- `.husky/pre-commit` — Create hook

**Out of scope:**

- Other editor configs (VS Code settings, etc.)
- CI changes (handled by Plan 005)

## Steps

### Step 1: Add `typecheck` script to `package.json`

```json
"typecheck": "tsc -b"
```

**Verify**: `grep -n '"typecheck"' package.json` → script present

### Step 2: Install husky and lint-staged

```bash
npm install -D husky lint-staged
```

**Verify**: `grep -n "husky" package.json` → in devDependencies

### Step 3: Add prepare script for husky

```json
"prepare": "husky"
```

**Verify**: `grep -n '"prepare"' package.json` → script present

### Step 4: Add lint-staged config to package.json

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,css}": [
    "prettier --write"
  ]
}
```

**Verify**: `grep -n "lint-staged" package.json` → config present

### Step 5: Initialize husky

```bash
npx husky init
```

**Verify**: `ls .husky/` → directory exists

### Step 6: Create pre-commit hook

Create `.husky/pre-commit`:

```bash
npx lint-staged
```

**Verify**: `cat .husky/pre-commit` → contains `npx lint-staged`

### Step 7: Create `.editorconfig`

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2
```

**Verify**: `cat .editorconfig` → config present

### Step 8: Run verification

```bash
npx tsc -b
npm run lint
npm test
```

All must pass.

## Test plan

- Verify `npm run typecheck` exits 0
- Verify pre-commit hook runs on staged files
- Verify `.editorconfig` is recognized by editors

## Done criteria

- [ ] `npx tsc -b` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `grep -n '"typecheck"' package.json` → script present
- [ ] `ls .husky/pre-commit` → file exists
- [ ] `cat .editorconfig` → config present
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- husky installation fails

## Maintenance notes

- The pre-commit hook runs lint-staged on every commit
- Lint-staged only processes staged files, not the entire codebase
- The `.editorconfig` ensures consistent whitespace across editors
- Consider adding a `commitlint` hook for conventional commit messages
