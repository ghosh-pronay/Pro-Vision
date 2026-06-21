import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const DEFAULT_FEATURES: Record<string, boolean> = {
  "features.habits": true,
  "features.expense": true,
  "features.focus": true,
  "features.wellbeing": true,
  "features.goals": true,
  "features.kanban": true,
  "features.news": true,
  "features.coach": true,
  "features.challenges": true,
  "features.adRewards": true,
};

const DEFAULT_LIMITS: Record<string, number> = {
  "limits.coachDailyMessages": 50,
  "limits.walletsPerUser": 10,
  "limits.freeTierWallets": 3,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DEFAULT_SYSTEM: Record<string, any> = {
  "system.maintenanceMode": false,
  "system.announcementBanner": "",
};

const DEFAULT_ADS: Record<string, boolean> = {
  "ads.enabled": true,
  "ads.sidebar": true,
  "ads.header": true,
  "ads.footer": true,
  "ads.inContent": true,
  "ads.rewardedVideo": true,
};

export function useSiteConfig() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = useQuery((api as any).siteConfig.getAll);

  const features = { ...DEFAULT_FEATURES };
  const limits = { ...DEFAULT_LIMITS };
  const system = { ...DEFAULT_SYSTEM };
  const ads = { ...DEFAULT_ADS };

  if (config) {
    Object.entries(config).forEach(([key, value]) => {
      if (key.startsWith("features.")) features[key] = Boolean(value);
      if (key.startsWith("limits.")) limits[key] = Number(value);
      if (key.startsWith("system.")) system[key] = value;
      if (key.startsWith("ads.")) ads[key] = Boolean(value);
    });
  }

  const isFeatureEnabled = (feature: string) =>
    features[`features.${feature}`] ?? true;
  const getLimit = (key: string) => limits[`limits.${key}`] ?? 0;
  const isMaintenanceMode = system["system.maintenanceMode"] ?? false;
  const getAnnouncement = () =>
    (system["system.announcementBanner"] as string) || "";
  const isAdEnabled = (placement: string) => ads[`ads.${placement}`] ?? true;

  return {
    config,
    features,
    limits,
    system,
    ads,
    isFeatureEnabled,
    getLimit,
    isMaintenanceMode,
    getAnnouncement,
    isAdEnabled,
  };
}
