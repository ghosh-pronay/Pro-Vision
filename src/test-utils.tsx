import { render, type RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { Toaster } from "sonner";

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AccessibilityProvider>
          {children}
          <Toaster />
        </AccessibilityProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react";
