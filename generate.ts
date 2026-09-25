import fs from "node:fs/promises";
import path from "node:path";
const filename = import.meta.filename as string;
const dirname = path.dirname(filename);

import sharp from "sharp";

interface LogoOptions {
  full?: boolean;
  background?: boolean;
}

interface AnimatedLogoOptions {
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
  const bgRect = background ? `${backgroundRect({ width, height })}\n` : "";

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
${bgRect}${paths.map((p) => `  <path d="${p.d}" fill="${p.fill}"/>`).join("\n")}
</svg>`;
}

interface Frame {
  width: number;
  height: number;
}

/** The opaque white layer the `_B` variants paint behind the artwork. */
const backgroundRect = (frame: Frame) =>
  `  <rect x="0" y="0" width="${frame.width}" height="${frame.height}" fill="#ffffff"/>`;

type Side = "top" | "right" | "bottom" | "left";

interface Bar {
  name: string;
  color: string;
  /** Frame edge the bar enters from. */
  side: Side;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Arrival order, clockwise from the top: orange -> green -> yellow -> blue. */
const bars: Bar[] = [
  { name: "orange", color: "#f34f1c", side: "top", x: 200, y: 100, width: 100, height: 500 },
  { name: "green", color: "#7fbc00", side: "right", x: 100, y: 200, width: 500, height: 100 },
  { name: "yellow", color: "#ffba01", side: "bottom", x: 400, y: 100, width: 100, height: 500 },
  { name: "blue", color: "#01a6f0", side: "left", x: 100, y: 400, width: 500, height: 100 },
];

/**
 * The one cell of the icon where a later bar ends up *above* an earlier one: the blue arm
 * crosses the orange column in front of it. Painting order draws orange on top, so blue is
 * drawn a second time, clipped to that cell, to keep the weave of the static logo.
 */
const overCell = { bar: "blue", x: 200, y: 400, width: 100, height: 100 };

/** Bars enter `step` seconds apart and each one flies for `travel` seconds. */
const step = 0.25;
const travel = 1.25;
/** Time until the last bar has landed. */
const assembly = travel + (bars.length - 1) * step;

const ENTRY: Record<Side, [number, number]> = {
  top: [0, -1],
  right: [1, 0],
  bottom: [0, 1],
  left: [-1, 0],
};

const pct = (seconds: number, total: number) => `${+((seconds / total) * 100).toFixed(4)}%`;

/**
 * Where a bar starts from: far enough out to clear the frame, plus a runway proportional to
 * that distance so every bar appears at the same point of its flight, in any frame size.
 */
function entryOffset(bar: Bar, frame: Frame, originX: number): string {
  const clearance = {
    top: bar.y + bar.height,
    bottom: frame.height - bar.y,
    left: bar.x + originX + bar.width,
    right: frame.width - bar.x - originX,
  }[bar.side];
  const [ux, uy] = ENTRY[bar.side];
  const reach = clearance + Math.round((clearance * 1.16) / 100) * 100;
  const dx = ux * reach;
  const dy = uy * reach;
  return `translate(${dx === 0 ? 0 : `${dx}px`}, ${dy === 0 ? 0 : `${dy}px`})`;
}

const weaveDefs = `  <defs>
    <clipPath id="weave-slot">
      <rect x="${overCell.x}" y="${overCell.y}" width="${overCell.width}" height="${overCell.height}"/>
    </clipPath>
  </defs>`;

/**
 * The icon: bars in paint order, so the last arrival ends up underneath, plus the weave
 * patch drawn last, where blue has to sit on top of the orange column.
 */
function iconMarkup(indent = "  "): string {
  const rect = (bar: Bar, pad: string) =>
    `${pad}<rect class="anim bar ${bar.name}" x="${bar.x}" y="${bar.y}" width="${bar.width}" height="${bar.height}" fill="${bar.color}"/>`;
  return [
    ...[...bars].reverse().map((bar) => rect(bar, indent)),
    `${indent}<g clip-path="url(#weave-slot)">`,
    rect(bars.find((bar) => bar.name === overCell.bar)!, `${indent}  `),
    `${indent}</g>`,
  ].join("\n");
}

const animRule = (total: number) => `    .anim {
      animation-duration: ${total}s;
      animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
      animation-fill-mode: forwards;
    }`;

/** The four flights, laid out on a timeline of `total` seconds. */
function iconRules(total: number, frame: Frame, originX: number): string {
  const names = bars
    .map((bar) => `    .bar.${bar.name} { animation-name: enter-${bar.name}; }`)
    .join("\n");
  const keyframes = bars
    .map((bar, i) => {
      const start = i * step;
      const arrived = start + travel;
      const waiting = start === 0 ? pct(0, total) : `${pct(0, total)}, ${pct(start, total)}`;
      const resting =
        arrived >= total ? pct(total, total) : `${pct(arrived, total)}, ${pct(total, total)}`;
      return `    @keyframes enter-${bar.name} {
      ${waiting} { transform: ${entryOffset(bar, frame, originX)}; }
      ${resting} { transform: translate(0, 0); }
    }`;
    })
    .join("\n");
  return `${names}\n${keyframes}`;
}

export function generateAnimatedLogo(options: AnimatedLogoOptions = {}): string {
  const { background = false } = options;
  const frame = { width: 700, height: 700 };

  return `<svg width="${frame.width}" height="${frame.height}" viewBox="0 0 ${frame.width} ${frame.height}" xmlns="http://www.w3.org/2000/svg">
${weaveDefs}
  <style>
${animRule(assembly)}
${iconRules(assembly, frame, 0)}
  </style>
${background ? `${backgroundRect(frame)}\n` : ""}${iconMarkup()}
</svg>`;
}

/** Named in the order of `textPaths`: the dot, then N, U and T. */
const glyphNames = ["dot", "n", "u", "t"];

/** Offset a glyph floats in from before it settles. */
const glyphFrom = "translate(80px, 30px)";

/**
 * Icon assembling in the middle of the frame, sliding left into place and `.NUT` floating in
 * beside it — the animated counterpart of `Logo_Full.svg`.
 */
export function generateAnimatedFullLogo(options: AnimatedLogoOptions = {}): string {
  const { background = false } = options;
  const frame = { width: 2100, height: 700 };
  /** Keeps the assembling icon centred; the same distance it then slides left by. */
  const iconShift = 700;
  const slideStart = assembly;
  const slideEnd = assembly + 0.7;
  const floatStep = 0.1;
  const floatTime = 0.7;
  const hold = 0.3;

  const total = slideEnd + floatStep * (glyphNames.length - 1) + floatTime + hold;

  const glyphRules = glyphNames
    .map((name) => `    .glyph.${name} { animation-name: float-${name}; }`)
    .join("\n");
  const glyphKeyframes = glyphNames
    .map((name, i) => {
      const start = slideEnd + i * floatStep;
      return `    @keyframes float-${name} {
      ${pct(0, total)}, ${pct(start, total)} { transform: ${glyphFrom}; opacity: 0; }
      ${pct(start + floatTime, total)}, ${pct(total, total)} { transform: translate(0, 0); opacity: 1; }
    }`;
    })
    .join("\n");
  const glyphMarkup = textPaths
    .map(
      (path, i) => `  <g class="anim glyph ${glyphNames[i]}">
    <path d="${path.d}" fill="${path.fill}"/>
  </g>`,
    )
    .join("\n");

  return `<svg width="${frame.width}" height="${frame.height}" viewBox="0 0 ${frame.width} ${frame.height}" xmlns="http://www.w3.org/2000/svg">
${weaveDefs}
  <style>
${animRule(total)}
${iconRules(total, frame, iconShift)}
    .stage { animation-name: slide; animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1); }
${glyphRules}
    @keyframes slide {
      ${pct(0, total)}, ${pct(slideStart, total)} { transform: translate(${iconShift}px, 0); }
      ${pct(slideEnd, total)}, ${pct(total, total)} { transform: translate(0, 0); }
    }
${glyphKeyframes}
  </style>
${background ? `${backgroundRect(frame)}\n` : ""}  <g class="anim stage">
${iconMarkup("    ")}
  </g>
${glyphMarkup}
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
  const animated: [string, string][] = [
    ["Logo_Animated.svg", generateAnimatedLogo()],
    ["Logo_Animated_B.svg", generateAnimatedLogo({ background: true })],
    ["Logo_Animated_Full.svg", generateAnimatedFullLogo()],
    ["Logo_Animated_Full_B.svg", generateAnimatedFullLogo({ background: true })],
  ];
  for (const [filename, svg] of animated) {
    const file = path.resolve(outputDir, "dist", filename);
    await fs.writeFile(file, svg, "utf-8");
    console.log(`Generated: ${file}`);
  }
}

generateAll();
