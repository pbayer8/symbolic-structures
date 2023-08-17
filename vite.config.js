import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  return {
    base: command === "build" ? "/symbolic-structures/dist/" : "/",
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          screensaver: resolve(__dirname, "paths/screensaver.html"),
          stars: resolve(__dirname, "paths/stars.html"),
          cell: resolve(__dirname, "paths/cell.html"),
          life: resolve(__dirname, "paths/life.html"),
          berry: resolve(__dirname, "paths/berry.html"),
        },
      },
    },
  };
});
