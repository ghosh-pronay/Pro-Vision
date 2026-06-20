import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

type FontSize = "small" | "medium" | "large";

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: FontSize;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityContextType extends AccessibilitySettings {
  setReducedMotion: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  setFontSize: (value: FontSize) => void;
  setScreenReaderMode: (value: boolean) => void;
  setKeyboardNavigation: (value: boolean) => void;
}

const STORAGE_KEY = "provision-accessibility";

const defaults: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  fontSize: "medium",
  screenReaderMode: false,
  keyboardNavigation: true,
};

function getSystemReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function loadSettings(): AccessibilitySettings {
  if (typeof window === "undefined") return defaults;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AccessibilitySettings>;
      return { ...defaults, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...defaults, reducedMotion: getSystemReducedMotion() };
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

const fontSizeClasses: Record<FontSize, string> = {
  small: "text-sm",
  medium: "",
  large: "text-lg",
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings);

  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.classList.remove("text-sm", "text-lg");
    if (settings.fontSize !== "medium") {
      root.classList.add(fontSizeClasses[settings.fontSize]);
    }

    // High contrast
    root.classList.toggle("high-contrast", settings.highContrast);

    // Reduced motion
    root.classList.toggle("reduced-motion", settings.reducedMotion);

    // Screen reader mode
    root.classList.toggle("sr-mode", settings.screenReaderMode);

    // Keyboard navigation
    root.classList.toggle("kb-nav", settings.keyboardNavigation);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      setSettings((prev) => {
        if (localStorage.getItem(STORAGE_KEY)) return prev;
        return { ...prev, reducedMotion: e.matches };
      });
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setReducedMotion = useCallback(
    (value: boolean) => setSettings((s) => ({ ...s, reducedMotion: value })),
    [],
  );
  const setHighContrast = useCallback(
    (value: boolean) => setSettings((s) => ({ ...s, highContrast: value })),
    [],
  );
  const setFontSize = useCallback(
    (value: FontSize) => setSettings((s) => ({ ...s, fontSize: value })),
    [],
  );
  const setScreenReaderMode = useCallback(
    (value: boolean) => setSettings((s) => ({ ...s, screenReaderMode: value })),
    [],
  );
  const setKeyboardNavigation = useCallback(
    (value: boolean) =>
      setSettings((s) => ({ ...s, keyboardNavigation: value })),
    [],
  );

  const value: AccessibilityContextType = {
    ...settings,
    setReducedMotion,
    setHighContrast,
    setFontSize,
    setScreenReaderMode,
    setKeyboardNavigation,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider",
    );
  }
  return context;
}
