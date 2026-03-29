import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Karaoke-Demo/" : "/",
  plugins: [svelte()],
  server: {
    host: true,
    port: 5173,
  },
}));
