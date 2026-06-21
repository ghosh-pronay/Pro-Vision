import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "convex/react": path.resolve(__dirname, "./src/convex/react.ts"),
      "convex/_generated/api": path.resolve(
        __dirname,
        "./src/convex/_generated/api.ts",
      ),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      external: (id) => {
        if (
          id.includes("src/convex/") &&
          !id.includes("_generated") &&
          !id.includes("react")
        ) {
          return true;
        }
        return false;
      },
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router"],
          "convex-vendor": ["convex"],
          "radix-ui": [
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-progress",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
          "framer-motion": ["framer-motion"],
          "lucide-react": ["lucide-react"],
          "ui-libs": ["sonner", "zustand", "zustand/middleware"],
          charts: ["recharts"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    chunkSizeWarningLimit: 500,
    target: "esnext",
    minify: "esbuild",
    cssMinify: "esbuild",
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router", "@convex-dev/auth/react"],
  },
  server: {
    hmr: true,
  },
});
