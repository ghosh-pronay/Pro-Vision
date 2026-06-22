import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useAdStatus() {
  const profile = useQuery(api.userProfiles.get);

  const profileData = profile as Record<string, unknown> | null;
  const isPremium = (profileData?.isPremium as boolean | undefined) === true;
  const premiumExpiresAt = profileData?.premiumExpiresAt as number | undefined;
  const isPremiumActive =
    isPremium &&
    (premiumExpiresAt === undefined || premiumExpiresAt > Date.now());

  return {
    isLoading: profile === undefined,
    showAds: !isPremiumActive,
    isPremium: isPremiumActive,
  };
}
