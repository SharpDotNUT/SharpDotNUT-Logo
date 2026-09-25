/**
 * `<logo-anim>` — plays one of the generated animated SVGs and exposes speed and playback
 * controls.
 *
 * The generated SVGs carry their own timeline (`.anim { animation-duration: 2s | 4s }`), drive
 * every keyframe with percentages and use no `animation-delay`, so overriding that single
 * duration rescales the whole choreography uniformly. The base duration is read back with
 * `getComputedStyle` rather than hard-coded, which keeps this file independent of `generate.ts`
 * and of the frame size each variant uses.
 *
 * The markup lives in a shadow root: the SVG's `#weave-slot` clip path and its `@keyframes`
 * names stay scoped, several instances coexist on one page, and page CSS cannot reach the
 * animation — hence `speed`, `paused` and the methods below as the control surface.
 */

/** `src` -> promise of SVG text, shared by every instance. */
const sources = new Map();

/** `base` is the SVG's own duration in seconds; `speed` is the multiplier applied to it. */
const rules = (base, speed) => `
    :host { display: inline-block; line-height: 0; }
    :host([hidden]) { display: none; }
    svg { display: block; width: 100%; height: auto; }
    svg .anim { animation-duration: ${+(base / speed).toFixed(4)}s; }
    :host([paused]) svg .anim { animation-play-state: paused; }
    @media (prefers-reduced-motion: reduce) {
      svg .anim { animation-duration: 0s !important; }
    }
`;

export class LogoAnim extends HTMLElement {
  static observedAttributes = ["src", "speed", "paused", "alt"];

  #root = this.attachShadow({ mode: "open" });
  /** Appended behind the SVG, so it beats the SVG's own `.anim` rule (same specificity, later). */
  #style = document.createElement("style");
  /** Seconds the SVG would take unmodified. */
  #base = 0;
  /** Renders in flight; a stale one must not overwrite a newer one. */
  #token = 0;
  #source = null;

  connectedCallback() {
    this.#label();
    void this.#mount();
  }

  disconnectedCallback() {
    this.#token++;
  }

  attributeChangedCallback(name, previous, value) {
    if (previous === value) return;
    if (name === "alt") {
      this.#label();
      return;
    }
    if (name === "speed") {
      this.#sync();
      return;
    }
    // `paused` needs no script: `:host([paused])` is CSS.
    if (name === "src") void this.#mount();
  }

  /** Playback rate multiplier: `2` plays twice as fast. Invalid values fall back to `1`. */
  get speed() {
    return this.#rate();
  }

  set speed(value) {
    this.setAttribute("speed", String(value));
  }

  /** `true` while the animation is frozen on its current frame. */
  get paused() {
    return this.hasAttribute("paused");
  }

  set paused(value) {
    this.toggleAttribute("paused", Boolean(value));
  }

  play() {
    this.paused = false;
  }

  pause() {
    this.paused = true;
  }

  /** Restarts from the first frame, resuming if the animation was paused. */
  replay() {
    this.paused = false;
    void this.#mount(true);
  }

  #rate() {
    const value = Number.parseFloat(this.getAttribute("speed") ?? "1");
    return Number.isFinite(value) && value > 0 ? value : 1;
  }

  /** `alt` gives the element an accessible name; without one it is decorative. */
  #label() {
    const alt = this.getAttribute("alt");
    if (alt) {
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", alt);
      this.removeAttribute("aria-hidden");
      return;
    }
    this.removeAttribute("role");
    this.removeAttribute("aria-label");
    this.setAttribute("aria-hidden", "true");
  }

  #sync() {
    this.#style.textContent = rules(this.#base, this.#rate());
  }

  async #mount(force = false) {
    const src = this.getAttribute("src");
    const token = ++this.#token;
    if (!src) {
      this.#source = null;
      this.#root.replaceChildren();
      return;
    }
    // Computed styles need a live tree; connection re-runs this.
    if (!this.isConnected) return;
    if (!force && src === this.#source) {
      this.#sync();
      return;
    }

    let pending = sources.get(src);
    if (pending === undefined) {
      pending = fetch(src).then((response) => {
        if (!response.ok) {
          throw new Error(`logo-anim: ${response.status} ${response.statusText} for ${src}`);
        }
        return response.text();
      });
      pending.catch(() => sources.delete(src));
      sources.set(src, pending);
    }

    let markup;
    try {
      markup = await pending;
    } catch (error) {
      if (token === this.#token) console.error(error);
      return;
    }
    if (token !== this.#token || !this.isConnected) return;

    const svg = new DOMParser().parseFromString(markup, "image/svg+xml").documentElement;
    if (svg.nodeName !== "svg") {
      console.error(`logo-anim: ${src} is not an SVG document`);
      return;
    }
    this.#source = src;
    this.#root.replaceChildren(document.adoptNode(svg));
    // Read the SVG's own duration while its `.anim` rule is still alone in the shadow tree.
    const sample = this.#root.querySelector(".anim");
    this.#base = sample ? Number.parseFloat(getComputedStyle(sample).animationDuration) || 0 : 0;
    this.#root.append(this.#style);
    this.#sync();
  }
}

if (!customElements.get("logo-anim")) {
  customElements.define("logo-anim", LogoAnim);
}
