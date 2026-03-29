import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/karaoke-demo/" : "/",
  plugins: [svelte()],
  server: {
    host: true,
    port: 5173,
  },
}));
