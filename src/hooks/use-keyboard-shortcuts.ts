import { useEffect } from "react";
import { useNavigate } from "react-router";

const SHORTCUTS: Record<string, string> = {
  g: "/dashboard",
  t: "/todo",
  h: "/habits",
  e: "/expense",
  f: "/focus",
  w: "/wellbeing",
  r: "/reports",
  s: "/settings",
  l: "/goals",
};

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    let pendingG = false;
    let gTimeout: ReturnType<typeof setTimeout> | null = null;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest("[contenteditable]")
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "?") {
        e.preventDefault();
        const helpText = Object.entries(SHORTCUTS)
          .map(([key, path]) => `  g ${key} → ${path}`)
          .join("\n");
        alert(`Keyboard Shortcuts:\n\n${helpText}`);
        return;
      }

      if (e.key === "Escape") {
        if (pendingG) {
          pendingG = false;
          if (gTimeout) clearTimeout(gTimeout);
        }
        return;
      }

      if (e.key === "g") {
        e.preventDefault();
        pendingG = true;
        gTimeout = setTimeout(() => {
          pendingG = false;
        }, 1000);
        return;
      }

      if (pendingG && SHORTCUTS[e.key]) {
        e.preventDefault();
        pendingG = false;
        if (gTimeout) clearTimeout(gTimeout);
        navigate(SHORTCUTS[e.key]);
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (gTimeout) clearTimeout(gTimeout);
    };
  }, [navigate]);
}
