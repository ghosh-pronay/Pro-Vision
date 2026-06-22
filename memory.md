# Pro-Vision Project Memory

## Project Overview

- **Goal**: Make local Pro-Vision at `E:\Pro-Vision` identical to deployed version at `https://provision.freebuff.app/`
- **Local deploy target**: `https://pro-visions.web.app/` (Firebase backend) — confirmed working
- **GitHub repo**: `https://github.com/ghosh-pronay/Pro-Vision`
- **Firebase project**: `pro-visions`

## Current Status

- **Landing page**: Local `src/Landing.tsx` (1471 lines) matches deployed version exactly — zero code differences
- **Auth**: Firebase config hardcoded in `src/lib/firebase.ts` (commit `3dee3e6`), Email/Password + Anonymous sign-in enabled in Firebase Console
- **Line endings**: `.gitattributes` added (commit `76b7e7b`) — CRLF warnings resolved permanently
- **All commits pushed to `main`**

## Key Technical Details

- Architecture differs (local=Firebase, deployed=target-src=Convex) but landing page code is identical
- `src/convex/_generated/api.js` was replaced with a stub shim (was importing broken convex server files)
- GitHub Actions workflow fixed with `actions/setup-node@v4` (Node 20)
- Firebase secret `FIREBASE_SERVICE_ACCOUNT_PRO_VISIONS` configured
- Pre-existing LSP error about `lucide-react` types is unrelated
- Build produces CSS warnings about `@container` escaping (cosmetic, not blocking)

## Completed Work

1. Fixed hero section spacing (badge, logo, subtitle, CTA, trust, preview card)
2. Fixed Stats section padding
3. Restored navbar to `flex justify-between` layout
4. Removed broken CSS grid layout
5. Fixed GitHub Actions workflow (Node 20 setup)
6. Fixed `src/convex/_generated/api.js` blank site issue
7. Added `.gitattributes` for line ending normalization
8. Hardcoded Firebase config in `src/lib/firebase.ts` (commit `3dee3e6`)
9. User enabled Email/Password + Anonymous sign-in in Firebase Console
10. Expense section: Added 12 default wallets (Cash In Hand, Cash Reserve Fund, Bkash, Nagad, Rocket, Upay, Brac Bank, DBBL Bank, Credit Card DBBL/Shimanto/Meghna, Others)
11. Expense section: 3 buttons — Add Income, Add Expense, Fund Transfer
12. Expense section: Wallet dropdown for all transactions (income/expense/transfer)
13. Expense section: Total Income / Total Expense accumulated across wallets
14. Expense section: Show/hide wallets via eye icon toggle
15. Expense section: Edit wallet names via edit modal
16. Expense section: Merged wallet management into Expense page (add, edit, delete, set default) — removed separate /wallets page dependency

## Expense Section Instructions

- Default wallets auto-added: Cash (In Hand), Cash (Reserve Fund), Bkash, Nagad, Rocket, Upay, Brac Bank, DBBL Bank, Credit Card (DBBL), Credit Card (Shimanto), Credit Card (Meghna), Others
- Users can add more wallets on demand
- 3 buttons: Add Income, Add Expense, Fund Transfer
- Wallet dropdown in all transaction forms
- Income/Expense accumulated as Total Income / Total Expense across all wallets
- Users can show/hide wallets by choice
- Users can edit wallet names
- Wallet management merged into Expense section (no separate wallets page)

## Relevant Files

- `src/pages/Landing.tsx`: Main landing page (1471 lines) — matches deployed
- `src/App.tsx`: Router config — Auth route at `/auth`
- `src/index.css`: All CSS classes — matches deployed CSS
- `src/lib/firebase.ts`: Firebase config with hardcoded API keys
- `src/hooks/use-auth.ts`: Auth hook with Firebase auth
- `src/pages/Auth.tsx`: Auth page component
- `target-src/pages/Landing.tsx`: Compiled deployed version (reference)
- `.gitattributes`: Line ending normalization config
- `.github/workflows/firebase-hosting-merge.yml`: Deploy workflow
