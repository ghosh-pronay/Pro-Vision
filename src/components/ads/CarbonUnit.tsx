import { useEffect, useRef } from "react";
import { AD_NETWORKS, type AdPosition } from "./adConfig";

interface CarbonUnitProps {
  position: AdPosition;
  className?: string;
}

export default function CarbonUnit({ position, className }: CarbonUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { serve, placement } = AD_NETWORKS.carbon;

  useEffect(() => {
    if (!serve || !containerRef.current) return;

    const scriptId = "carbon-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = `https://cdn.carbonads.com/carbon.js?serve=${serve}&placement=${placement}`;
      document.head.appendChild(script);
    }
  }, [serve, placement]);

  if (!serve) return null;

  return (
    <div ref={containerRef} className={`carbon-ad ${className ?? ""}`}>
      <div id="carbonads" />
    </div>
  );
}
