import fs from "node:fs/promises";
import path from "node:path";
const filename = import.meta.filename as string;
const dirname = path.dirname(filename);

import sharp from "sharp";

interface LogoOptions {
  full?: boolean;
  background?: boolean;
}

const iconPaths = [
  { d: "M 200,400 L 200,100 L 300,100 L 300,400 Z", fill: "#f34f1c" },
  { d: "M 200,500 L 300,500 L 300,600 L 200,600 Z", fill: "#f34f1c" },
  { d: "M 300,200 L 600,200 L 600,300 L 300,300 Z", fill: "#7fbc00" },
  { d: "M 100,200 L 200,200 L 200,300 L 100,300 Z", fill: "#7fbc00" },
  { d: "M 500,300 L 500,600 L 400,600 L 400,300 Z", fill: "#ffba01" },
  { d: "M 400,100 L 500,100 L 500,200 L 400,200 Z", fill: "#ffba01" },
  { d: "M 400,500 L 100,500 L 100,400 L 400,400 Z", fill: "#01a6f0" },
  { d: "M 500,400 L 600,400 L 600,500 L 500,500 Z", fill: "#01a6f0" },
];

const textPaths = [
  { d: "M 700,500 L 800,500 L 800,600 L 700,600 Z", fill: "#000000" },
  {
    d: "M 900,100 L 1200,100 L 1200,600 L 1100,600 L 1100,200 L 1000,200 L 1000,600 L 900,600 Z",
    fill: "#000000",
  },
  {
    d: "M 1300,100 L 1400,100 L 1400,500 L 1500,500 L 1500,100 L 1600,100 L 1600,600 L 1300,600 Z",
    fill: "#000000",
  },
  {
    d: "M 1700,100 L 2000,100 L 2000,200 L 1900,200 L 1900,600 L 1800,600 L 1800,200 L 1700,200 Z",
    fill: "#000000",
  },
];

export function generateLogo(options: LogoOptions = {}): string {
  const { full = false, background = false } = options;
  const width = full ? 2100 : 700;
  const height = 700;

  const paths = [...iconPaths, ...(full ? textPaths : [])];
  const bgRect = background
    ? `  <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>\n`
    : "";

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
${bgRect}${paths.map((p) => `  <path d="${p.d}" fill="${p.fill}"/>`).join("\n")}
</svg>`;
}

export async function generateAll(outputDir: string = "."): Promise<void> {
  const variants: [string, LogoOptions][] = [
    ["Logo", { full: false, background: false }],
    ["Logo_B", { full: false, background: true }],
    ["Logo_Full", { full: true, background: false }],
    ["Logo_Full_B", { full: true, background: true }],
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
}

generateAll();
