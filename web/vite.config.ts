import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three") || id.includes("node_modules/@react-three")) {
            if (id.includes("node_modules/three")) return "three";
            if (id.includes("@react-three")) return "react-three";
          }
        },
      },
    },
  },
  optimizeDeps: {
    rolldownOptions: {
      include: ["three", "@react-three/fiber", "@react-three/postprocessing"],
    },
  },
});
