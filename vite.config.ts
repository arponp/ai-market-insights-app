import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      "^(/multipass/api|/api)": {
        target: "https://arponpurkayastha.usw-3.palantirfoundry.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
