import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    /* keep every bundled photo as its own cacheable file */
    assetsInlineLimit: 2048,
  },
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    // Allow the Arena preview proxy host(s) to load the dev server.
    allowedHosts: true,
    hmr: { clientPort: 443 },
  },
});
