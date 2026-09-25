/**
 * Types for the `<logo-anim>` custom element, mirroring `logo-anim.js` by hand — the public surface
 * is the four attributes (`src`, `speed`, `paused`, `alt`), the three methods and the two mirrored
 * properties. Keep both files in step.
 */
export declare class LogoAnim extends HTMLElement {
  static readonly observedAttributes: readonly string[];
  /** Playback rate multiplier: `2` plays twice as fast. Invalid values fall back to `1`. */
  speed: number;
  /** `true` while the animation is frozen on its current frame. */
  paused: boolean;
  play(): void;
  pause(): void;
  /** Restarts from the first frame, resuming if the animation was paused. */
  replay(): void;
}

declare global {
  interface HTMLElementTagNameMap {
    "logo-anim": LogoAnim;
  }
}
