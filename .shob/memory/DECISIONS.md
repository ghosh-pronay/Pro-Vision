# Decisions (newest first)

## 2026-06-17 — Ad Manager Wrapper approach

**Why:** Single AdManager component wrapping all networks with fallback logic, chosen over network-specific components or script injection. Easier to maintain and extend.

## 2026-06-17 — Premium = ad-free

**Why:** Premium users see NO ads. Free users see all ads. Simple rule, no partial ad blocking.

## 2026-06-17 — No custom ad analytics

**Why:** Rely on network dashboards (AdSense, Ezoic, etc.) instead of building custom tracking. Reduces complexity.

## 2026-06-17 — Slot fallback chain

**Why:** Sidebar→carbon→adsense→ezoic, header→ezoic→adsense→mediavine, footer→adsense→ezoic→mediavine, in-content→ezoic→adsense→mediavine. Ensures ads always render if any network is configured.

## 2026-06-17 — All network config via VITE\_\* env vars

**Why:** No hardcoded credentials. Safe default: no ads render without config.

## 2026-06-17 — Premium detection uses users.isPremium + premiumExpiresAt

**Why:** From Convex users table, returned via userProfiles.get query. Checks both flag and expiry.

## 2026-06-17 — Admin role check via Convex queries

**Why:** admin.ts queries verify role === "admin" before returning data. Secure backend enforcement.

## 2026-06-17 — setupFirstAdmin with hasAdmin guard

**Why:** Button only shows when no admin exists. Prevents unauthorized admin creation.

## 2026-06-17 — @/ alias resolves to ./src/

**Why:** Via vite.config.ts. Standard Vite convention.
