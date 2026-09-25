import fs from "node:fs/promises";
import path from "node:path";
import {
  cornerRadius,
  generateAnimatedFullLogo,
  generateAnimatedLogo,
  generateLogo,
} from "./logo.ts";
import type { LogoOptions } from "./logo.ts";
import { writePngs } from "./rasterize.js";

/**
 * Writes the 12 artifacts into `<outputDir>/dist`, resolved against `process.cwd()`: the 6 static
 * variants as `.svg`, the 6 animated ones as `.svg`, then the PNGs of the static six through
 * `writePngs` — skipped, with a log line, when `sharp` is not installed.
 */
async function generateAll(outputDir: string = "."): Promise<void> {
  const dist = path.resolve(outputDir, "dist");
  await fs.mkdir(dist, { recursive: true });

  const variants: [string, LogoOptions][] = [
    ["Logo", { full: false, background: false }],
    ["Logo_B", { full: false, background: true }],
    ["Logo_BR", { full: false, background: true, round: cornerRadius }],
    ["Logo_Full", { full: true, background: false }],
    ["Logo_Full_B", { full: true, background: true }],
    ["Logo_Full_BR", { full: true, background: true, round: cornerRadius }],
  ];

  for (const [filename, opts] of variants) {
    const svg = path.resolve(dist, filename + ".svg");
    await fs.writeFile(svg, generateLogo(opts), "utf-8");
    console.log(`Generated: ${svg}`);
  }
  const animated: [string, string][] = [
    ["Logo_Animated.svg", generateAnimatedLogo()],
    ["Logo_Animated_B.svg", generateAnimatedLogo({ background: true })],
    ["Logo_Animated_BR.svg", generateAnimatedLogo({ background: true, round: cornerRadius })],
    ["Logo_Animated_Full.svg", generateAnimatedFullLogo()],
    ["Logo_Animated_Full_B.svg", generateAnimatedFullLogo({ background: true })],
    ["Logo_Animated_Full_BR.svg", generateAnimatedFullLogo({ background: true, round: cornerRadius })],
  ];
  for (const [filename, svg] of animated) {
    const file = path.resolve(dist, filename);
    await fs.writeFile(file, svg, "utf-8");
    console.log(`Generated: ${file}`);
  }

  await writePngs(dist, { from: dist });
}

await generateAll();
