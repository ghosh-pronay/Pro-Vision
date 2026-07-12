import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

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
          return true
        }
        return false
      },
      output: {
        manualChunks(id) {
          if (
            id.includes("recharts") ||
            id.includes("victory") ||
            id.includes("/d3-") ||
            id.includes("d3/") ||
            id.includes("vendor")
          ) {
            return "charts"
          }
          if (id === "react" || id === "react-dom" || id === "react-router") {
            return "react-vendor"
          }
          if (id.includes("framer-motion")) {
            return "framer-motion"
          }
          if (id.includes("lucide-react")) {
            return "lucide-react"
          }
          if (id === "sonner" || id === "zustand" || id.includes("/zustand/")) {
            return "ui-libs"
          }
        },
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    chunkSizeWarningLimit: 500,
    target: "esnext",
    minify: "esbuild",
    cssMinify: "esbuild",
  },
  esbuild: {
    drop: ["debugger"],
    pure: ["console.log", "console.info"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router"],
  },
  server: {
    hmr: true,
  },
})
