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
      "convex/values": path.resolve(__dirname, "./src/convex/shims/values.ts"),
      "convex/server": path.resolve(__dirname, "./src/convex/shims/server.ts"),
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
          "framer-motion": ["framer-motion"],
          "lucide-react": ["lucide-react"],
          "ui-libs": ["sonner", "zustand", "zustand/middleware"],
          charts: ["recharts"],
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
    include: ["react", "react-dom", "react-router"],
  },
  server: {
    hmr: true,
  },
});
