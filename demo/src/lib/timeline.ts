export interface BarStep {
  /** Bar class name: `.bar.<name>` / `@keyframes enter-<name>`. */
  name: string;
  /** Seconds the bar starts flying. */
  launch: number;
  /** Seconds the bar has landed. */
  land: number;
}

/**
 * Reads the flights out of an animated SVG's own timeline. `logo.ts:102-105` owns `step` /
 * `travel`; the file spells them as percentages, so the demo follows the artifact instead of
 * keeping a second copy of the numbers.
 */
export function readSteps(css: string, total: number): BarStep[] {
  const steps: BarStep[] = [];

  for (const [, name, body] of css.matchAll(/@keyframes enter-(\w+)\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g)) {
    const stops = [...body.matchAll(/((?:\s*[\d.]+%,?)+)\s*\{\s*transform\s*:/g)];
    const hold = stops[0]?.[1];
    const landing = stops[1]?.[1];
    if (!hold || !landing) continue;
    // `0%, 12.5% { … }` holds until the last percentage, then `75%, 100% { … }` starts at the first.
    const launch = (hold.match(/[\d.]+/g) ?? []).map(Number).at(-1);
    const land = (landing.match(/[\d.]+/g) ?? []).map(Number).at(0);
    if (launch === undefined || land === undefined) continue;
    steps.push({ name, launch: (launch / 100) * total, land: (land / 100) * total });
  }

  return steps;
}
