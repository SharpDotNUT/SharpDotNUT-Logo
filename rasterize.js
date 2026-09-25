/**
 * SVG -> PNG rasterization, shared by the repo generator (`generate.ts`) and by consumers who want
 * the PNGs:
 *
 *     import { writePngs } from "@sharpdotnut/logo/rasterize.js";
 *     await writePngs("./public/brand");   // reads the SVGs shipped in this package
 *
 * `sharp` is an optional dependency, so it cannot be imported statically: a static import would
 * throw at load time on an install without the native binary and take the PNGs' callers down with
 * it. It is loaded on demand instead.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** The SVGs shipped with this package — the default source for `writePngs`. */
const bundledDist = fileURLToPath(new URL("./dist/", import.meta.url));

/** The six static variants — the animated ones have no settled single frame to rasterize. */
export const staticVariants = [
  "Logo",
  "Logo_B",
  "Logo_BR",
  "Logo_Full",
  "Logo_Full_B",
  "Logo_Full_BR",
];

/**
 * Rasterizes `<from>/<name>.svg` into `<outDir>/<name>.png` for every name, creating `outDir`.
 * `from` defaults to the SVGs shipped in this package; `generate.ts` passes its own output dir.
 *
 * @param {string} outDir Directory for the PNGs; created when missing.
 * @param {{ from?: string, names?: string[] }} [options] Source dir and variant names.
 * @returns {Promise<boolean>} `false`, after logging why, when `sharp` is not installed.
 */
export async function writePngs(outDir, { from = bundledDist, names = staticVariants } = {}) {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.log(`sharp is unavailable (${reason}) — writing the SVGs only`);
    return false;
  }

  await fs.mkdir(outDir, { recursive: true });
  for (const name of names) {
    const svg = await fs.readFile(path.join(from, `${name}.svg`));
    const png = path.join(outDir, `${name}.png`);
    await fs.writeFile(png, await sharp(svg).png().toBuffer());
    console.log(`Generated: ${png}`);
  }
  return true;
}
