/* the project carries no node types — this is the one place the config
   reads an environment variable, so it declares it locally */
declare const process: { env: Record<string, string | undefined> };

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * The HMR websocket follows the page's own port by default — which is what a
 * phone on the LAN needs (`http://192.168.x.x:5173` → `ws://192.168.x.x:5173`).
 * Behind a hosting proxy that terminates TLS and forwards the port under 443,
 * pin it with `VITE_HMR_PORT=443 vite`; without the pin the client would keep
 * dialling the dev-server port and only ever see websocket errors.
 */
const HMR_PORT = process.env.VITE_HMR_PORT;

export default defineConfig({
  build: {
    /* keep every bundled photo as its own cacheable file */
    assetsInlineLimit: 2048,
    target: "es2022",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion")) return "vendor-motion";
            if (id.includes("react") || id.includes("clsx")) return "vendor-react";
            return "vendor";
          }
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  server: {
    /* 0.0.0.0, not localhost: the dev server has to answer on the LAN so a
       phone can open it at http://<pc-ip>:5173 */
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    // Allow the Arena preview proxy host(s) to load the dev server.
    allowedHosts: true,
    hmr: HMR_PORT ? { clientPort: Number(HMR_PORT) } : undefined,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
    },
  },
  /* `npm run preview` gets the same treatment, so the production bundle can
     be tested from the phone too */
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: false,
    allowedHosts: true,
  },
});
