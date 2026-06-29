import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["functions/__tests__/**/*.test.js"],
    exclude: ["node_modules", "dist"],
    env: {
      NODE_PATH: "functions/node_modules",
    },
  },
})
