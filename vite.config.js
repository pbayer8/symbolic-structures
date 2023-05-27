import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/dist/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        screensaver: resolve(__dirname, "paths/screensaver.html"),
        stars: resolve(__dirname, "paths/stars.html"),
        cell: resolve(__dirname, "paths/cell.html"),
      },
    },
  },
});
