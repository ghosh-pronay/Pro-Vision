import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useAdStatus() {
  const profile = useQuery(api.userProfiles.get);

  const isPremium = (profile as any)?.isPremium === true;

  const premiumExpiresAt = (profile as any)?.premiumExpiresAt as
    | number
    | undefined;
  const isPremiumActive =
    isPremium &&
    (premiumExpiresAt === undefined || premiumExpiresAt > Date.now());

  return {
    isLoading: profile === undefined,
    showAds: !isPremiumActive,
    isPremium: isPremiumActive,
  };
}
