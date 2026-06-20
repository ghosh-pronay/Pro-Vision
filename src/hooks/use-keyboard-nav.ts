import { useEffect, useCallback, useRef, type RefObject } from "react";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  alt?: boolean;
  shift?: boolean;
  handler: (e: KeyboardEvent) => void;
  description?: string;
}

interface ArrowNavigationOptions {
  orientation?: "horizontal" | "vertical" | "both";
  loop?: boolean;
  onSelect?: (element: HTMLElement) => void;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "textarea:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
    '[role="menuitem"]:not([disabled])',
    '[role="tab"]:not([disabled])',
  ].join(", ");
  return Array.from(container.querySelectorAll(selectors));
}

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean = true,
) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const focusable = getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;

      const currentFocusable = getFocusableElements(container);
      if (currentFocusable.length === 0) return;

      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    container.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [containerRef, isActive]);
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  isActive: boolean = true,
) {
  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

        if (keyMatch && ctrlMatch && metaMatch && altMatch && shiftMatch) {
          e.preventDefault();
          shortcut.handler(e);
          return;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, isActive]);
}

export function useArrowNavigation(
  containerRef: RefObject<HTMLElement | null>,
  options: ArrowNavigationOptions = {},
) {
  const { orientation = "vertical", loop = true, onSelect } = options;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) return;

      const currentIndex = focusable.indexOf(
        document.activeElement as HTMLElement,
      );
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      let handled = false;

      switch (e.key) {
        case "ArrowDown":
          if (orientation === "vertical" || orientation === "both") {
            nextIndex = currentIndex + 1;
            handled = true;
          }
          break;
        case "ArrowUp":
          if (orientation === "vertical" || orientation === "both") {
            nextIndex = currentIndex - 1;
            handled = true;
          }
          break;
        case "ArrowRight":
          if (orientation === "horizontal" || orientation === "both") {
            nextIndex = currentIndex + 1;
            handled = true;
          }
          break;
        case "ArrowLeft":
          if (orientation === "horizontal" || orientation === "both") {
            nextIndex = currentIndex - 1;
            handled = true;
          }
          break;
        case "Home":
          nextIndex = 0;
          handled = true;
          break;
        case "End":
          nextIndex = focusable.length - 1;
          handled = true;
          break;
        case "Enter":
        case " ":
          if (onSelect) {
            onSelect(focusable[currentIndex]);
            handled = true;
          }
          break;
      }

      if (handled) {
        e.preventDefault();
        if (loop) {
          nextIndex = (nextIndex + focusable.length) % focusable.length;
        } else {
          nextIndex = Math.max(0, Math.min(nextIndex, focusable.length - 1));
        }
        focusable[nextIndex].focus();
      }
    },
    [containerRef, orientation, loop, onSelect],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [containerRef, handleKeyDown]);
}
