import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useAdStatus() {
  const profile = useQuery(api.userProfiles.get);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isPremium = (profile as any)?.isPremium === true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const premiumExpiresAt = (profile as any)?.premiumExpiresAt as
    | number
    | undefined;
  const isPremiumActive =
    isPremium &&
    // eslint-disable-next-line react-hooks/purity
    (premiumExpiresAt === undefined || premiumExpiresAt > Date.now());

  return {
    isLoading: profile === undefined,
    showAds: !isPremiumActive,
    isPremium: isPremiumActive,
  };
}
