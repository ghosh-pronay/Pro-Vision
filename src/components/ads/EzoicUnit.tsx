import { useEffect, useRef } from "react";
import { AD_NETWORKS, type AdPosition } from "./adConfig";

interface EzoicUnitProps {
  position: AdPosition;
  className?: string;
}

export default function EzoicUnit({ position, className }: EzoicUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { siteId } = AD_NETWORKS.ezoic;

  useEffect(() => {
    if (!siteId) return;

    const scriptId = "ezoic-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = "https://www.ezojs.com/ezoic.js";
      script.setAttribute("data-cfasync", "false");
      document.head.appendChild(script);
    }
  }, [siteId]);

  if (!siteId) return null;

  const placeholderMap: Record<AdPosition, string> = {
    sidebar: "ezoic-sidebar",
    header: "ezoic-header",
    footer: "ezoic-footer",
    "in-content": "ezoic-in-content",
    rewarded: "",
  };

  const placeholder = placeholderMap[position];
  if (!placeholder) return null;

  return (
    <div ref={containerRef} className={`ezoic-ad ${className ?? ""}`}>
      <div id={`ezoic-placeholder-${placeholder}`} />
    </div>
  );
}
