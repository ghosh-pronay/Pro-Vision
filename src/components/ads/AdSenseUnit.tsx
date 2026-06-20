import { useEffect, useRef } from "react";
import { AD_NETWORKS, type AdPosition } from "./adConfig";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdSenseUnitProps {
  position: AdPosition;
  slot: string;
  className?: string;
}

export default function AdSenseUnit({
  position,
  slot,
  className,
}: AdSenseUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { clientId } = AD_NETWORKS.adsense;

  useEffect(() => {
    if (!clientId || !slot) return;

    const scriptId = "adsense-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js`;
      document.head.appendChild(script);
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not ready
    }
  }, [clientId, slot, position]);

  if (!clientId || !slot) return null;

  const isInContent = position === "in-content";

  return (
    <div ref={containerRef} className={`ad-sense-unit ${className ?? ""}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...(isInContent ? { minHeight: 250 } : {}) }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={isInContent ? "auto" : undefined}
        data-full-width-responsive={isInContent ? "true" : undefined}
      />
    </div>
  );
}
