import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@core": resolve(__dirname, "src/core"),
      "@presets": resolve(__dirname, "src/presets"),
      "@agents": resolve(__dirname, "src/agents"),
      "@ui": resolve(__dirname, "src/ui"),
    },
  },
});
