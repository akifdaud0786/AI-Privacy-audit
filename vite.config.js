import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = env.VITE_BACKEND_URL || "http://localhost:8000";

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    // For production, we don't have a proxy, so we might need a different strategy 
    // or just use absolute URLs if VITE_BACKEND_URL is set.
    // However, usually it's better to handle the base URL in the fetch calls.
  };
});
