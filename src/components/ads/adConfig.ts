export type AdPosition =
  | "sidebar"
  | "in-content"
  | "header"
  | "footer"
  | "rewarded";

export type AdSize =
  | "banner-728x90"
  | "banner-320x50"
  | "banner-160x600"
  | "native"
  | "video";

export type AdNetwork = "adsense" | "ezoic" | "mediavine" | "carbon" | "admob";

interface AdNetworkConfig {
  adsense: {
    clientId: string;
    slots: Partial<Record<AdPosition, string>>;
  };
  ezoic: {
    siteId: string;
  };
  mediavine: {
    siteId: string;
    minimumSessions: number;
  };
  carbon: {
    serve: string;
    placement: string;
  };
  admob: {
    appId: string;
    bannerId: string;
    rewardedId: string;
  };
}

interface SlotConfig {
  preferred: AdNetwork;
  fallbacks: AdNetwork[];
}

export const AD_NETWORKS: AdNetworkConfig = {
  adsense: {
    clientId: import.meta.env.VITE_ADSENSE_CLIENT_ID || "",
    slots: {
      sidebar: import.meta.env.VITE_ADSENSE_SIDEBAR_SLOT || "",
      header: import.meta.env.VITE_ADSENSE_HEADER_SLOT || "",
      footer: import.meta.env.VITE_ADSENSE_FOOTER_SLOT || "",
      "in-content": import.meta.env.VITE_ADSENSE_INCONTENT_SLOT || "",
    },
  },
  ezoic: {
    siteId: import.meta.env.VITE_EZOIC_SITE_ID || "",
  },
  mediavine: {
    siteId: import.meta.env.VITE_MEDIAVINE_SITE_ID || "",
    minimumSessions: 50000,
  },
  carbon: {
    serve: import.meta.env.VITE_CARBON_SERVE || "",
    placement: import.meta.env.VITE_CARBON_PLACEMENT || "",
  },
  admob: {
    appId: import.meta.env.VITE_ADMOB_APP_ID || "",
    bannerId: import.meta.env.VITE_ADMOB_BANNER_ID || "",
    rewardedId: import.meta.env.VITE_ADMOB_REWARDED_ID || "",
  },
};

export const SLOT_DEFAULTS: Record<AdPosition, SlotConfig> = {
  sidebar: { preferred: "carbon", fallbacks: ["adsense", "ezoic"] },
  header: { preferred: "ezoic", fallbacks: ["adsense", "mediavine"] },
  footer: { preferred: "adsense", fallbacks: ["ezoic", "mediavine"] },
  "in-content": { preferred: "ezoic", fallbacks: ["adsense", "mediavine"] },
  rewarded: { preferred: "admob", fallbacks: [] },
};

export const AD_SIZE_MAP: Record<AdSize, string> = {
  "banner-728x90": "728x90",
  "banner-320x50": "320x50",
  "banner-160x600": "160x600",
  native: "auto",
  video: "video",
};

export function isNetworkConfigured(network: AdNetwork): boolean {
  switch (network) {
    case "adsense":
      return !!AD_NETWORKS.adsense.clientId;
    case "ezoic":
      return !!AD_NETWORKS.ezoic.siteId;
    case "mediavine":
      return !!AD_NETWORKS.mediavine.siteId;
    case "carbon":
      return !!AD_NETWORKS.carbon.serve;
    case "admob":
      return !!AD_NETWORKS.admob.appId;
    default:
      return false;
  }
}

export function resolveNetwork(position: AdPosition): AdNetwork | null {
  const slot = SLOT_DEFAULTS[position];
  if (isNetworkConfigured(slot.preferred)) return slot.preferred;
  for (const fallback of slot.fallbacks) {
    if (isNetworkConfigured(fallback)) return fallback;
  }
  return null;
}
