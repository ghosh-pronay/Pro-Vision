# Ad Monetization Design Spec

**Date:** 2026-06-17
**Status:** Approved
**Approach:** Ad Manager Wrapper

## Goal

Integrate multiple ad networks into Pro-Vision to generate revenue from free-tier users while keeping premium users ad-free.

## Requirements

- **Networks:** Google AdSense, Google AdMob, Ezoic, Mediavine, Carbon Ads
- **Placements:** Sidebar banner, In-content/native, Header/footer banner, Rewarded video
- **Free vs Premium:** Premium users see no ads; free users see all ads
- **Analytics:** Use network dashboards (no custom ad analytics)

## Architecture

### File Structure

```
src/components/ads/
├── AdManager.tsx          # Central orchestrator
├── AdSlot.tsx             # Generic ad slot component
├── AdSenseUnit.tsx        # Google AdSense renderer
├── EzoicUnit.tsx          # Ezoic renderer
├── CarbonUnit.tsx         # Carbon Ads renderer
├── MediavineUnit.tsx      # Mediavine renderer
├── RewardedVideo.tsx      # Rewarded ad modal
├── adConfig.ts            # Network configs, slot definitions
└── useAdStatus.ts         # Hook to check free/premium tier
```

### AdManager Flow

1. Query `userProfiles` via Convex
2. If `tier === "premium"` → return null (no ads)
3. If `tier === "free"` or no profile → render ad slots
4. For each slot, load preferred network with fallbacks

### Ad Placements

```
┌─────────────────────────────────────────────┐
│  HeaderBanner (728x90 desktop / 320x50 mob) │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │         Page Content             │
│ Banner   │                                  │
│ (160x600)│    InContentAd                   │
│          │                                  │
├──────────┴──────────────────────────────────┤
│  FooterBanner (728x90 desktop / 320x50 mob) │
└─────────────────────────────────────────────┘
```

- **Sidebar:** Desktop only (`md:` breakpoint), fixed position
- **In-content:** Between page sections
- **Header/Footer:** Always visible, responsive
- **Rewarded:** Modal triggered by user action

### Network Integration

| Network    | Script                                                   | Format                         | Notes                       |
| ---------- | -------------------------------------------------------- | ------------------------------ | --------------------------- |
| AdSense    | `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js` | Banner, native                 | Needs account + ad unit IDs |
| Ezoic      | `www.ezojs.com/ezoic.js`                                 | AI-optimized                   | Requires site ID            |
| Mediavine  | `scripts.mediavine.com/tags/<site-id>.js`                | Native, banner                 | Requires 50k sessions/month |
| Carbon Ads | `cdn.carbonads.com/carbon.js`                            | Developer-focused              | Simple embed                |
| AdMob      | Capacitor plugin                                         | Banner, interstitial, rewarded | Mobile PWA only             |

### Slot Configuration

```ts
{
  networks: {
    adsense: { clientId: "ca-pub-XXX", slots: { sidebar: "...", header: "..." } },
    ezoic: { siteId: "12345", placeholders: [...] },
    mediavine: { siteId: "...", minimumSessions: 50000 },
    carbon: { serve: "...", placement: "..." },
    admob: { appId: "...", bannerId: "...", rewardedId: "..." }
  },
  slotDefaults: {
    sidebar: { preferred: "carbon", fallbacks: ["adsense", "ezoic"] },
    header: { preferred: "ezoic", fallbacks: ["adsense"] },
    inContent: { preferred: "ezoic", fallbacks: ["adsense"] },
    footer: { preferred: "adsense", fallbacks: ["ezoic"] },
    rewarded: { preferred: "admob", fallbacks: [] }
  }
}
```

### Premium Tier Handling

- `useAdStatus()` hook queries `userProfiles` from Convex
- `tier === "premium"` → `AdManager` returns `null`
- `tier === "free"` or no profile → render ads
- Rewarded video: watch ad → unlock feature for 24h via `rewardExpiry` timestamp

## Implementation Steps

1. Create `adConfig.ts` with network configs and slot defaults
2. Create `useAdStatus.ts` hook for premium check
3. Create `AdSenseUnit.tsx` component
4. Create `EzoicUnit.tsx` component
5. Create `CarbonUnit.tsx` component
6. Create `MediavineUnit.tsx` component
7. Create `RewardedVideo.tsx` modal component
8. Create `AdSlot.tsx` generic slot with fallback logic
9. Create `AdManager.tsx` orchestrator
10. Integrate `AdManager` into `DashboardLayout.tsx`
11. Add `rewardExpiry` field to `userProfiles` Convex schema
12. Add rewarded video trigger to relevant premium features
13. Test all placements across networks
14. Build and verify

## Success Criteria

- [ ] Ads render on all 4 placement types for free users
- [ ] Premium users see zero ads
- [ ] Network fallbacks work (primary → secondary)
- [ ] Rewarded video modal opens and tracks completion
- [ ] Build passes with no errors
