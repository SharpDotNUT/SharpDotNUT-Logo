import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  cornerRadius,
  generateAnimatedFullLogo,
  generateAnimatedLogo,
  generateLogo,
} from "./logo.ts";
import type { LogoOptions } from "./logo.ts";

async function generateAll(outputDir: string = "."): Promise<void> {
  const variants: [string, LogoOptions][] = [
    ["Logo", { full: false, background: false }],
    ["Logo_B", { full: false, background: true }],
    ["Logo_BR", { full: false, background: true, round: cornerRadius }],
    ["Logo_Full", { full: true, background: false }],
    ["Logo_Full_B", { full: true, background: true }],
    ["Logo_Full_BR", { full: true, background: true, round: cornerRadius }],
  ];

  for (const [filename, opts] of variants) {
    const svg = path.resolve(outputDir, "dist", filename + ".svg");
    const png = path.resolve(outputDir, "dist", filename + ".png");
    const svgFile = generateLogo(opts);
    const pngFile = sharp(Buffer.from(svgFile, "utf-8")).png();
    await fs.writeFile(svg, svgFile, "utf-8");
    await fs.writeFile(png, pngFile);
    console.log(`Generated: ${svg}, ${png}`);
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
    const file = path.resolve(outputDir, "dist", filename);
    await fs.writeFile(file, svg, "utf-8");
    console.log(`Generated: ${file}`);
  }
}

await generateAll();
