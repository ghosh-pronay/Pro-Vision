import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "oled" | "system";
export type Language = "en" | "bn";

interface AppState {
  theme: Theme;
  language: Language;
  sidebarOpen: boolean;
  coachOpen: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCoach: () => void;
  setCoachOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "light",
      language: "en",
      sidebarOpen: true,
      coachOpen: false,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleCoach: () => set((s) => ({ coachOpen: !s.coachOpen })),
      setCoachOpen: (coachOpen) => set({ coachOpen }),
    }),
    { name: "provision-app" },
  ),
);

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  currency: string;
  timezone: string;
  profession?: string;
  bodyWeight?: number;
  isPremium: boolean;
  premiumExpiry?: string;
}

interface UserState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
