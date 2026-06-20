import { useEffect, useRef } from "react";
import { AD_NETWORKS, type AdPosition } from "./adConfig";

interface MediavineUnitProps {
  position: AdPosition;
  className?: string;
}

export default function MediavineUnit({
  position,
  className,
}: MediavineUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { siteId } = AD_NETWORKS.mediavine;

  useEffect(() => {
    if (!siteId) return;

    const scriptId = "mediavine-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = `https://scripts.mediavine.com/tags/${siteId}.js`;
      document.head.appendChild(script);
    }
  }, [siteId]);

  if (!siteId) return null;

  const slotMap: Record<AdPosition, string> = {
    sidebar: "mediavine-sidebar",
    header: "mediavine-header",
    footer: "mediavine-footer",
    "in-content": "mediavine-content",
    rewarded: "",
  };

  const slot = slotMap[position];
  if (!slot) return null;

  return (
    <div ref={containerRef} className={`mediavine-ad ${className ?? ""}`}>
      <div data-mediavine-ad-slot={slot} />
    </div>
  );
}
