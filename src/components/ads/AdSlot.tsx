import { useState } from "react";
import { type AdPosition, type AdNetwork, resolveNetwork } from "./adConfig";
import AdSenseUnit from "./AdSenseUnit";
import EzoicUnit from "./EzoicUnit";
import CarbonUnit from "./CarbonUnit";
import MediavineUnit from "./MediavineUnit";

interface AdSlotProps {
  position: AdPosition;
  className?: string;
  networkOverride?: AdNetwork;
}

function NetworkRenderer({
  network,
  position,
}: {
  network: AdNetwork;
  position: AdPosition;
}) {
  switch (network) {
    case "adsense":
      return <AdSenseUnit position={position} slot="" />;
    case "ezoic":
      return <EzoicUnit position={position} />;
    case "carbon":
      return <CarbonUnit position={position} />;
    case "mediavine":
      return <MediavineUnit position={position} />;
    default:
      return null;
  }
}

export default function AdSlot({
  position,
  className,
  networkOverride,
}: AdSlotProps) {
  const [loadError, setLoadError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const network = networkOverride || resolveNetwork(position);

  if (!network || loadError) return null;

  return (
    <div
      className={`ad-slot ad-slot--${position} ${className ?? ""}`}
      data-ad-position={position}
      onError={() => setLoadError(true)}
    >
      <NetworkRenderer network={network} position={position} />
    </div>
  );
}
