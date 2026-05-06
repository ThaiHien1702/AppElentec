import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      https: {
        key: fs.readFileSync(path.resolve(__dirname, "../backend/certs/server.key")),
        cert: fs.readFileSync(path.resolve(__dirname, "../backend/certs/server.crt")),
      },
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_TARGET || "https://localhost:5001",
          changeOrigin: true,
          secure: false, // Vì dùng cert tự ký
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
