import { useCallback, useRef, useEffect } from "react";

type Priority = "polite" | "assertive";

interface Announcer {
  announce: (message: string, priority?: Priority) => void;
}

let announcerElement: HTMLElement | null = null;

function getAnnouncerElement(): HTMLElement {
  if (announcerElement && document.body.contains(announcerElement)) {
    return announcerElement;
  }

  announcerElement = document.getElementById("pv-announcer");
  if (announcerElement) return announcerElement;

  announcerElement = document.createElement("div");
  announcerElement.id = "pv-announcer";
  announcerElement.setAttribute("aria-live", "polite");
  announcerElement.setAttribute("aria-atomic", "true");
  announcerElement.className =
    "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)] [clip-path:inset(50%)]";
  document.body.appendChild(announcerElement);

  return announcerElement;
}

export function useAnnouncer(): Announcer {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const announce = useCallback(
    (message: string, priority: Priority = "polite") => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const el = getAnnouncerElement();
      el.setAttribute("aria-live", priority);
      el.textContent = "";

      timeoutRef.current = setTimeout(() => {
        el.textContent = message;
      }, 100);
    },
    [],
  );

  return { announce };
}
