import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

/** `PORT` wins when the environment sets a valid one (CI, preview harnesses); 5173 otherwise. */
function resolvePort(): number {
  const fromEnv = Number.parseInt(process.env.PORT ?? "", 10);
  return Number.isInteger(fromEnv) && fromEnv > 0 ? fromEnv : 5173;
}

export default defineConfig({
  plugins: [
    vue({ template: { compilerOptions: { isCustomElement: (tag) => tag === "logo-anim" } } }),
  ],
  server: {
    port: resolvePort(),
  },
  build: {
    // Keep the SVG assets as real files: `<logo-anim src>` then fetches a plain URL,
    // exactly as a consumer would, and the built assets stay inspectable.
    assetsInlineLimit: 0,
  },
});
