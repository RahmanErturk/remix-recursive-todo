import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
const isVitest = !!process.env.VITEST;

export default defineConfig({
  plugins: [
    tailwindcss(), 
    ...(isVitest ? [] : [reactRouter()]),
    tsconfigPaths()
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./app/test/vitest.setup.ts"],
  },
});
