import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/dogs": {
        target: "https://frontend-take-home-service.fetch.com",
        changeOrigin: true,
        secure: true,
      },
      "/auth": {
        target: "https://frontend-take-home-service.fetch.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
