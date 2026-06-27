# Plan 016: Fix README, add AGENTS.md, document architecture

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0ce2228..HEAD -- README.md AGENTS.md`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `0ce2228`, 2025-06-25

## Why this matters

The README lists "Three.js" as a dependency but it's not installed. There are no testing instructions. The Convex shim architecture is undocumented. There is no `AGENTS.md` for AI agent context. Contributors cannot understand why `convex` is in dependencies but the app runs on localStorage.

## Current state

- `README.md:21` — Lists "Three.js (3D graphics)" (not a dependency)
- `README.md:25-28` — Setup only shows `npm install` and `npm run dev`, no test commands
- `README.md:56` — `src/convex/ # Backend shim (placeholder)` (vague)
- No `AGENTS.md` exists

## Commands you will need

| Purpose | Command         | Expected on success |
| ------- | --------------- | ------------------- |
| Build   | `npm run build` | exit 0              |

## Scope

**In scope:**

- `README.md` — Fix Three.js reference, add testing section, document architecture
- `AGENTS.md` — Create with project context for AI agents

**Out of scope:**

- Other documentation files
- API documentation

## Steps

### Step 1: Remove Three.js from README

Delete line 21:

```markdown
- **Three.js** (3D graphics)
```

**Verify**: `grep -n "Three.js" README.md` → no matches

### Step 2: Add testing section to README

After the Setup section, add:

````markdown
## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
npm run verify        # Lint + typecheck + test
```
````

````

**Verify**: `grep -n "npm test" README.md` → testing commands present

### Step 3: Document Convex shim architecture

Expand the project structure section:

```markdown
├── convex/           # Convex backend definitions
│   ├── schema.ts     # Database schema (40+ tables)
│   ├── react.ts      # Local Convex shim (useQuery, useMutation)
│   └── _generated/   # Generated API (shimmed to localStorage)
````

Add an Architecture section:

```markdown
## Architecture

### Dual Backend Strategy

The app supports two data backends:

1. **Local Development (default)**: localStorage-backed Convex shim (`src/convex/react.ts`)
   - All data persists in the browser
   - No server required
   - Set `VITE_CONVEX_URL` to use real Convex

2. **Production (optional)**: Real Convex backend
   - Set `VITE_CONVEX_URL` in `.env.local`
   - Remove Vite aliases in `vite.config.ts`
   - Data syncs across devices

### AI Integration

- **Primary**: Google Gemini 2.0 Flash (via Cloud Function proxy)
- **Fallback**: Groq (llama-3.3-70b-versatile)
- API keys are server-side only (Cloud Functions)
```

**Verify**: `grep -n "Dual Backend" README.md` → architecture section present

### Step 4: Create `AGENTS.md`

Create `AGENTS.md` at project root:

````markdown
# Pro-Vision — Agent Context

## Project Overview

All-in-one productivity app for Bangladesh. React 19 + TypeScript + Vite PWA with Firebase Auth, Convex (shimmed to localStorage), and AI Coach (Gemini + Groq).

## Build & Test Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run verify        # Lint + typecheck + test
npm test              # Run tests
npm run lint          # ESLint
npx tsc -b            # TypeScript check
```
````

## Architecture

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 + Shadcn UI
- **State**: Zustand (global UI) + localStorage (data)
- **Backend**: Firebase Auth + Convex (shimmed) + Cloud Functions
- **AI**: Gemini (primary) + Groq (fallback) via Cloud Function proxy

## Key Files

- `src/App.tsx` — Routes (55+ lazy-loaded pages)
- `src/lib/store/index.ts` — localStorage data store
- `src/convex/react.ts` — Convex shim (useQuery/useMutation)
- `src/lib/ai.ts` — AI integration
- `src/hooks/use-auth.ts` — Firebase auth hook

## Conventions

- Use Shadcn UI components from `src/components/ui/`
- Follow existing patterns in `src/lib/store/` for new data modules
- All routes are lazy-loaded in `src/App.tsx`
- Use `useI18n()` hook for translations (Bengali/English)
- Use `cn()` utility for className merging

## Known Gotchas

- Convex shim uses localStorage — data is browser-only
- Groq API key must be server-side (Cloud Function)
- Admin role is stored in Firestore `users` collection
- FCM tokens stored in localStorage, cleared on sign-out

````

**Verify**: `cat AGENTS.md` → file exists with content

### Step 5: Run verification

```bash
npm run build
````

Must pass.

## Test plan

- Verify README is accurate (no false dependencies)
- Verify AGENTS.md contains all required sections
- Verify architecture documentation matches actual code structure

## Done criteria

- [ ] `npm run build` exits 0
- [ ] `grep -n "Three.js" README.md` → no matches
- [ ] `grep -n "npm test" README.md` → testing commands present
- [ ] `grep -n "Dual Backend" README.md` → architecture section present
- [ ] `cat AGENTS.md` → file exists
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt

## Maintenance notes

- Keep AGENTS.md updated when adding new features or changing architecture
- The README should always reflect the actual dependencies and commands
- Consider adding a CONTRIBUTING.md for external contributors
- Document any new environment variables in `.env.example` and README
