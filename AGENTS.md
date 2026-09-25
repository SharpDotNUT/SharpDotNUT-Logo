# Repository Guidelines

Brand asset source for **SharpDotNUT**. Two TypeScript files emit the logo as SVG (+PNG) — `logo.ts`
builds the strings, `generate.ts` writes them — and one dependency-free web component plays the
animated variants on a page. `dist/` is committed output: its SVGs are the deliverable, its PNGs are
build leftovers.

## Project Overview

- One source of truth:
  - `logo.ts` — the artwork tables and the three pure SVG string builders (`generateLogo`,
    `generateAnimatedLogo`, `generateAnimatedFullLogo`); imports nothing, touches no file.
  - `generate.ts` — the entry: the `variants` / `animated` artifact tables, `sharp`→PNG and the
    `dist/` writes; its top-level `await generateAll()` is the only side effect in the repo.
  - `logo-anim.js` — `<logo-anim>` custom element: fetches one animated SVG into a shadow root and
    exposes `speed` / `paused` / `replay()`.
  - `index.html` + `README.md` — galleries and the component demo; `index.html` doubles as the
    visual check page, `README.md` is bilingual (every section English first, then Chinese).
- Artwork: a four-colour woven icon ("pinwheel") plus a `.NUT` wordmark, 700×700 (`iconFrame`) and
  2100×700 (`fullFrame`).
- No build step, bundler, test runner, linter or CI. `dist/*.svg` is tracked, `dist/*.png` is not
  (`.gitignore: *.png`).

## Architecture & Data Flow

The builders are data-driven, not a drawing program.

| Layer | Where | What it defines |
| --- | --- | --- |
| `iconPaths` / `glyphs` | `logo.ts:41`, `:56` | the artwork as literal path `d` strings, in paint order |
| `bars: Bar[]`, `overCell` | `logo.ts:76`, `:88` | the four bars (name, colour, entry `side`, x/y/w/h) and the single crossing cell where blue must sit on top of orange |
| `step`, `travel`, `assembly` | `logo.ts:102-105` | the animation timeline in seconds |
| `iconMarkup()`, `iconRules()`, `entryOffset()` | `logo.ts:144`, `:162`, `:120` | animated markup and percentage keyframes derived from `bars` |

- **One design unit = 100 SVG units** = bar thickness = artwork padding (`cornerRadius`,
  `logo.ts:95`). Express new geometry in units, never in ad-hoc pixels.
- Static logo (`generateLogo`, `logo.ts:182`) is plain filled paths in paint order. The animated
  logo (`logo.ts:213`, `:231`) is `<rect>` bars + a `#weave-slot` `clipPath` patch that re-draws
  blue over the crossing, plus percentage-only `@keyframes`. Both animated variants share the
  envelope in `animatedDocument` (`logo.ts:198`): a `body` for inside `<style>`, and the `children`
  artwork.
- **Invariant:** the animated build must strip down to the static one at rest — same shapes, same
  paint order, same colours. When shape data changes, compare both builds (method in Testing & QA).
- Timeline rule: every keyframe is a percentage and there is **no `animation-delay`**, so a single
  `animation-duration` on `.anim` rescales the whole choreography. `logo-anim.js` depends on that
  instead of parsing timings.
- Emission: `generateAll(outputDir = ".")` (`generate.ts:12`, not exported) writes the 6 static
  variants as `.svg` **and** `.png` (via `sharp`) and the 6 animated ones as `.svg` only. The entry
  calls it at top level (`generate.ts:46`), output is resolved against `process.cwd()`, and `dist/`
  must already exist (no `mkdir`). `logo.ts` never touches the file system, so importing it writes
  nothing.
- Runtime coupling: the component only knows the emitted class names — `.anim`, `.bar.<name>`,
  `.glyph.<name>`, `.stage`, `#weave-slot`, `@keyframes enter-* / float-* / slide`. Renaming any of
  them in `logo.ts` breaks `logo-anim.js`. Sharing no module across that boundary is deliberate: the
  contract is the emitted markup, not an import.

## Key Directories

- repo root — the entire source: `logo.ts`, `generate.ts`, `logo-anim.js`, `index.html`, `README.md`
  (plus `package.json`, `tsconfig.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.gitignore`)
- `dist/` — generated artifacts (12 tracked SVGs, 6 untracked PNGs). Never hand-edit.
- Absent on purpose: no `src/`, `scripts/`, `docs/`, `.github/`, no test directory.

## Development Commands

```bash
pnpm install            # the only install step (pnpm 11.x; pnpm-workspace.yaml allows sharp's build)
node generate.ts        # regenerate all of dist/ — run from the repo root
bun generate.ts         # equivalent; both run .ts through type stripping
git diff --stat dist/   # the de-facto regression check
```

- No `build`, `test`, `lint` or `format` script exists, and TypeScript is not installed —
  `tsconfig.json` is only there for editor typing: `module: nodenext` +
  `allowImportingTsExtensions` (so the editor accepts `from "./logo.ts"`), `noEmit`. Nothing reads
  it at runtime.
- Serving the demo needs a static file server; `file://` fails because `index.html` uses a module
  script and `<logo-anim>` uses `fetch`.

## Code Conventions & Common Patterns

- Formatting: 2-space indent, double quotes, semicolons, trailing commas, ~100 columns, matching
  every file.
- Line endings: `generate.ts` is **CRLF**, every other file (including `logo.ts`) is LF. Don't
  reflow it.
- The split is one-way: `generate.ts` imports `logo.ts`, `logo.ts` imports nothing — no `node:*`, no
  `sharp`. Keeping the builders dependency-free is what makes them importable from a throwaway
  script without touching `dist/`.
- Relative imports between the two modules carry the `.ts` extension (`from "./logo.ts"`); Node ESM
  resolves specifiers literally and type stripping keys off that extension.
- Naming:
  - artifacts `Logo{,_B,_BR,_Full,_Full_B,_Full_BR}.svg`, animated prefixed `Logo_Animated…`;
    `_B` = opaque white layer, `_BR` = that layer with `rx="100"`.
  - CSS: lowercase, variant-namespaced — `.anim`, `.bar.blue`, `.glyph.n`, `.stage`, clip id
    `weave-slot`.
  - functions/consts: plain camelCase, tables plural (`bars`, `glyphs`, `variants`), booleans as
    options (`full`, `background`) with `round` for the layer radius.
- SVG emission: template literals with explicit per-level indentation (`iconMarkup(indent)`), one
  element per line, stable attribute order (`class, x, y, width, height, rx, fill`) so generated
  files diff cleanly.
- Numbers in markup: percentages through `pct()` (4 decimals) — reuse it, don't inline `toFixed`.
- Comments explain *why* a mechanic exists (the weave patch, the entry runway, the pinwheel order);
  exported functions and data tables carry JSDoc.
- `logo-anim.js` patterns: private `#fields`, open shadow root, per-source `fetch` cache shared
  across instances, monotonic `#token` so a stale render cannot win, injected `#style` appended
  **after** the SVG (equal specificity, later wins) to override `.anim`, attributes as the source of
  truth with properties as thin accessors, invalid `speed` falls back to `1`, `alt` toggles
  `role="img"` + `aria-label` versus `aria-hidden="true"`, and
  `@media (prefers-reduced-motion: reduce)` freezes the timeline. Keep it dependency-free.

## Important Files

- `logo.ts:182` `generateLogo({ full?, background?, round? })`, `logo.ts:213` / `logo.ts:231`
  `generateAnimatedLogo` / `generateAnimatedFullLogo({ background?, round? })` — the three pure
  string builders; `logo.ts:198` `animatedDocument(frame, body, children, options)` is the envelope
  they both emit.
- `generate.ts:13` / `generate.ts:31` the `variants` / `animated` tables — the authoritative artifact
  list; `generate.ts:12` `generateAll(outputDir)`; `generate.ts:46` top-level `await generateAll()`.
- `logo.ts:41` / `:56` artwork tables, `:95` `cornerRadius`, `:76` `bars`, `:88` `overCell`, `:91` /
  `:92` `iconFrame` / `fullFrame` — the values to change when the mark itself changes.
- `logo-anim.js:31` `LogoAnim` (registered at `logo-anim.js:172`), `:20` shadow CSS (speed,
  reduced motion), `:33` `observedAttributes = ["src", "speed", "alt"]`.
- `index.html` — gallery for every committed artifact + six live `<logo-anim>` instances with speed
  slider and Pause/Replay; body-only fragment (no doctype/head).
- `README.md` — bilingual, every gallery listed once; variant semantics (`README.md:24-28`) and the
  component API table (`:54-59`).
- `package.json` (deps only), `tsconfig.json` (editor options), `pnpm-workspace.yaml` (sharp build
  allowlist), `.gitignore` (`/node_modules`, `*.png`).

## Runtime/Tooling Preferences

- Runtime: Node ≥ 24 for direct `.ts` execution (Node 24.14 used here) or Bun 1.3.x. ESM only;
  `package.json` has no `type: module`, so Node prints a one-off `MODULE_TYPELESS_PACKAGE_JSON`
  warning — harmless, don't "fix" it by adding fields that change module resolution.
- Package manager: pnpm 11.x; `pnpm-workspace.yaml` is settings-only (`allowBuilds: sharp: true`,
  required for sharp's native binary). No `packageManager` field.
- Dependencies: `sharp` and `@types/node`, both under `dependencies`, none in `devDependencies`.
- Environment: a Windows checkout (`core.ignorecase=true`, `core.filemode=false`); don't rely on
  POSIX-only tooling or on case-sensitive paths.

## Testing & QA

- No test framework, no spec files, no CI. Verification means regenerating and reading the diff.
- **Golden files:** the 12 tracked `dist/*.svg` are the regression baseline. After any change that is
  not meant to alter output, `node generate.ts && git diff --stat dist/` must be empty. A non-empty
  diff is a review artefact: explain it or revert it.
- Because `logo.ts` is side-effect free, the builders can also be compared against the committed
  artifacts without writing anything — run from the repo root:
  `node --input-type=module -e "const fs=await import('node:fs/promises'),m=await import('./logo.ts');console.log(m.generateLogo()===await fs.readFile('dist/Logo.svg','utf8'))"`
  prints `true`, and `git status --porcelain dist/` stays empty.
- PNGs are gitignored, so they never appear in diffs — inspect `dist/*.png` by eye after touching
  the `sharp` call.
- Static↔animated equivalence is the second check when shape data changes: strip the `<style>` block
  from an animated variant and its `<rect>` bars sit at the settled frame, which must match the
  corresponding static file.
- `index.html` served over http is the manual surface: galleries for every artifact, plus six live
  component instances driven by the speed slider, Pause/Resume and Replay.
- Adding a variant means editing in lockstep: the `variants` / `animated` tables
  (`generate.ts:13`, `:31`), the README gallery (`README.md:6-13`, `:16-22`) **and both language
  paragraphs** of its prose, and every gallery section of `index.html` (lines 10-90) — the component
  demo lists one instance per animated variant.
