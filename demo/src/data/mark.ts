import Logo from "@sharpdotnut/logo/Logo.svg?url";
import Logo_B from "@sharpdotnut/logo/Logo_B.svg?url";
import Logo_BR from "@sharpdotnut/logo/Logo_BR.svg?url";
import Logo_Animated from "@sharpdotnut/logo/Logo_Animated.svg?url";
import Logo_Animated_B from "@sharpdotnut/logo/Logo_Animated_B.svg?url";
import Logo_Animated_BR from "@sharpdotnut/logo/Logo_Animated_BR.svg?url";
import Logo_Full from "@sharpdotnut/logo/Logo_Full.svg?url";
import Logo_Full_B from "@sharpdotnut/logo/Logo_Full_B.svg?url";
import Logo_Full_BR from "@sharpdotnut/logo/Logo_Full_BR.svg?url";
import Logo_Animated_Full from "@sharpdotnut/logo/Logo_Animated_Full.svg?url";
import Logo_Animated_Full_B from "@sharpdotnut/logo/Logo_Animated_Full_B.svg?url";
import Logo_Animated_Full_BR from "@sharpdotnut/logo/Logo_Animated_Full_BR.svg?url";

/**
 * Mirrors the `bars` table in logo.ts:76 — the source module does not export it. Keep in step.
 */
export const bars = [
  { name: "orange", color: "#f34f1c" },
  { name: "green", color: "#7fbc00" },
  { name: "yellow", color: "#ffba01" },
  { name: "blue", color: "#01a6f0" },
] as const;

/** `bars` as a lookup, so templates can colour a step without scanning the table. */
export const barColor: Record<string, string> = Object.fromEntries(
  bars.map((bar) => [bar.name, bar.color]),
);

/** Frame edge each bar flies in from — same values as `side` in logo.ts:77-80. */
export const barSide: Record<string, "top" | "right" | "bottom" | "left"> = {
  orange: "top",
  green: "right",
  yellow: "bottom",
  blue: "left",
};

export const wordmark = "#000000";

export type ArtifactKind = "static" | "animated";
export type ArtifactLayer = "none" | "white" | "rounded";

export interface Artifact {
  file: string;
  url: string;
  kind: ArtifactKind;
  layer: ArtifactLayer;
  group: "icon" | "full";
  width: number;
  height: number;
}

export const artifacts: Artifact[] = [
  { file: "Logo.svg", url: Logo, kind: "static", layer: "none", group: "icon", width: 700, height: 700 },
  { file: "Logo_B.svg", url: Logo_B, kind: "static", layer: "white", group: "icon", width: 700, height: 700 },
  { file: "Logo_BR.svg", url: Logo_BR, kind: "static", layer: "rounded", group: "icon", width: 700, height: 700 },
  { file: "Logo_Animated.svg", url: Logo_Animated, kind: "animated", layer: "none", group: "icon", width: 700, height: 700 },
  { file: "Logo_Animated_B.svg", url: Logo_Animated_B, kind: "animated", layer: "white", group: "icon", width: 700, height: 700 },
  { file: "Logo_Animated_BR.svg", url: Logo_Animated_BR, kind: "animated", layer: "rounded", group: "icon", width: 700, height: 700 },
  { file: "Logo_Full.svg", url: Logo_Full, kind: "static", layer: "none", group: "full", width: 2100, height: 700 },
  { file: "Logo_Full_B.svg", url: Logo_Full_B, kind: "static", layer: "white", group: "full", width: 2100, height: 700 },
  { file: "Logo_Full_BR.svg", url: Logo_Full_BR, kind: "static", layer: "rounded", group: "full", width: 2100, height: 700 },
  { file: "Logo_Animated_Full.svg", url: Logo_Animated_Full, kind: "animated", layer: "none", group: "full", width: 2100, height: 700 },
  { file: "Logo_Animated_Full_B.svg", url: Logo_Animated_Full_B, kind: "animated", layer: "white", group: "full", width: 2100, height: 700 },
  { file: "Logo_Animated_Full_BR.svg", url: Logo_Animated_Full_BR, kind: "animated", layer: "rounded", group: "full", width: 2100, height: 700 },
];

/** Raw markup for the two inline SVGs (the only in-document SVG injections). */
export { default as staticIconMarkup } from "@sharpdotnut/logo/Logo.svg?raw";
export { default as animatedIconMarkup } from "@sharpdotnut/logo/Logo_Animated.svg?raw";

export { Logo_Animated_Full as fullLogoUrl, Logo_Animated_Full_BR as fullLogoRoundedUrl };
export { Logo_Animated as animatedIconUrl };
