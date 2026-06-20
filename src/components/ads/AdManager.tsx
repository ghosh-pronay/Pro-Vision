import { useAdStatus } from "./useAdStatus";
import AdSlot from "./AdSlot";
import { type AdPosition } from "./adConfig";

interface AdManagerProps {
  positions?: AdPosition[];
  className?: string;
}

const DEFAULT_POSITIONS: AdPosition[] = [
  "header",
  "sidebar",
  "in-content",
  "footer",
];

export default function AdManager({
  positions = DEFAULT_POSITIONS,
  className,
}: AdManagerProps) {
  const { isLoading, showAds } = useAdStatus();

  if (isLoading || !showAds) return null;

  return (
    <div className={`ad-manager ${className ?? ""}`}>
      {positions.includes("header") && (
        <div className="ad-manager__header">
          <AdSlot position="header" className="mb-4" />
        </div>
      )}

      {positions.includes("sidebar") && (
        <div className="ad-manager__sidebar hidden lg:block">
          <AdSlot position="sidebar" className="sticky top-6" />
        </div>
      )}

      {positions.includes("in-content") && (
        <div className="ad-manager__in-content">
          <AdSlot position="in-content" className="my-6" />
        </div>
      )}

      {positions.includes("footer") && (
        <div className="ad-manager__footer">
          <AdSlot position="footer" className="mt-4" />
        </div>
      )}
    </div>
  );
}

export { default as AdSlot } from "./AdSlot";
export { default as RewardedVideo } from "./RewardedVideo";
export { useAdStatus } from "./useAdStatus";
export type { AdPosition, AdNetwork } from "./adConfig";
