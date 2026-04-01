import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const devHost = env.VITE_DEV_HOST || "0.0.0.0";
  const devPort = Number(env.VITE_DEV_PORT || 5173);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: devHost,
      port: devPort,
      strictPort: true,
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_TARGET || "http://localhost:5001",
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: devHost,
      port: devPort,
      strictPort: true,
    },
  };
});
