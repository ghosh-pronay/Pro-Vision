import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AuthProvider } from "@/contexts/AuthContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AccessibilityProvider>
            <App />
          </AccessibilityProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
