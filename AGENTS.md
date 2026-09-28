# Repository Guidelines

Brand asset source for **SharpDotNUT**, published as the npm package **`@sharpdotnut/logo`**. The
repository has two parts with different rules:

1. **The package (repo root) — in scope.** Four hand-written sources emit the logo as SVG
   (`logo.ts` builds the strings, `generate.ts` writes them, `rasterize.js` renders the PNGs) and one
   dependency-free web component (`logo-anim.js` + `logo-anim.d.ts`) plays the animated variants on a
   page. `dist/` is committed output: its 12 SVGs are the deliverable and the package payload, its 6
   PNGs are build leftovers.
2. **The demo site (`demo/`) — a subproject of this repository.** It is versioned here and belongs to
   this project, but **this file does not describe it**: `demo/AGENTS.md` owns every rule and detail
   under `demo/` — read that one before touching anything in there, and don't restate its contents
   here. What matters up here is only the boundary — **do not cross it without being asked:** package
   work must not modify `demo/`, demo work must not modify the repo root, and package workflows
   (`prepublishOnly`, `dist` drift checks, `npm pack`) never cover or publish `demo/`.

The package has **no runtime dependency**, no build step, no bundler, no test runner, no linter and
no CI. That is a statement about the package alone; `demo/` is not covered by it.

## Project Overview

- One source of truth for the artwork:
  - `logo.ts` — the artwork tables and the three pure SVG string builders (`generateLogo`,
    `generateAnimatedLogo`, `generateAnimatedFullLogo`); imports nothing, touches no file, has no
    side effect.
  - `generate.ts` — the **repo-only** generator: the `variants` / `animated` artifact tables and the
    `dist/` writes; its top-level `await generateAll()` is the only side effect in the package.
  - `rasterize.js` — the shipped SVG→PNG rasterizer (optional `sharp`): `generate.ts` calls it, and a
    consumer can call `writePngs(outDir)` from `@sharpdotnut/logo/rasterize.js`.
  - `logo-anim.js` (+ hand-written `logo-anim.d.ts`) — `<logo-anim>` custom element: fetches one
    animated SVG into a shadow root and exposes `speed` / `paused` / `replay()`.
- Root `index.html` + `README.md` are galleries and the component demo; `index.html` doubles as the
  visual check page, `README.md` is bilingual (every section English first, then Chinese).
- Artwork: a four-colour woven icon ("pinwheel") plus a `.NUT` wordmark, 700×700 (`iconFrame`) and
  2100×700 (`fullFrame`).
- No `bin` and no CLI on purpose: the package is a module surface (a custom element, an `exports` map
  and one documented function for the PNGs). Consumers script it instead of shelling out.

## Architecture & Data Flow

The builders are data-driven, not a drawing program.

|Layer|Where|What it defines|
|---|---|---|
|`iconPaths` / `glyphs`|`logo.ts:41`, `:56`|the artwork as literal path `d` strings, in paint order|
|`bars` / `overCell`|`logo.ts:76`, `:88`|the four bars (name, colour, entry `side`, x/y/w/h) and the single crossing cell where blue must sit on top of orange|
|`step` / `travel` / `assembly`|`logo.ts:102-105`|the icon animation timeline in seconds (`assembly` = 2.0 s)|
|full-logo clock|`logo.ts:233-241`|`slideEnd` 2.7 s, `floatStep` 0.1 s, `floatTime` 0.7 s, `hold` 0.3 s → `total` 4.0 s|
|`iconMarkup()`, `iconRules()`, `entryOffset()`|`logo.ts:144`, `:162`, `:120`|animated markup and percentage keyframes derived from `bars`|
|`pct()`|`logo.ts:114`|seconds → percentage string with 4 decimals; reuse it, never inline `toFixed`|

- **One design unit = 100 SVG units** = bar thickness = artwork padding (`cornerRadius`,
  `logo.ts:95`). Express new geometry in units, never in ad-hoc pixels. `_BR` variants round the
  background to exactly one unit.
- Static logo (`generateLogo`, `logo.ts:182`) is plain filled paths in paint order and emits **no
  `viewBox`** (only `width`/`height`). The animated variants (`logo.ts:213`, `:231`) are `<rect>` bars
  + a `#weave-slot` `clipPath` patch that re-draws blue over the crossing, plus percentage-only
  `@keyframes`. Both animated variants share the envelope in `animatedDocument` (`logo.ts:198`): a
  `body` for inside `<style>`, and the `children` artwork.
- **Invariant:** the animated build must strip down to the static one at rest — same geometry, same
  paint order, same colours. Equivalence is *geometric, not text-identical*: static emits `<path>`,
  animated emits `<rect class="anim bar …">`. Re-check it whenever shape data changes (method in
  Testing & QA).
- Timeline rule: every keyframe is a percentage and there is **no `animation-delay`**, so a single
  `animation-duration` on `.anim` rescales the whole choreography. `logo-anim.js` depends on that
  instead of parsing timings.
- Emission: `generateAll(outputDir = ".")` (`generate.ts:17`, not exported) writes the 6 static
  variants as `.svg`, the 6 animated ones as `.svg`, then the PNGs of the static six through
  `writePngs(dist, { from: dist })` (`generate.ts:49`) — skipped, with a log line, when `sharp` is
  absent. Output is `<outputDir>/dist`, resolved against `process.cwd()` (`generate.ts:18`), created
  if missing; the entry runs it at top level (`generate.ts:52`). `logo.ts` never touches the file
  system, so importing it writes nothing and never restales `dist/`.
- **Runtime coupling:** the component only knows the emitted class names — `.anim`, `.bar.<name>`,
  `.glyph.<name>`, `.stage`, `#weave-slot`, `@keyframes enter-* / float-* / slide`. Renaming any of
  them in `logo.ts` breaks `logo-anim.js`. Sharing no module across that boundary is deliberate: the
  contract is the emitted markup, not an import.

## Key Directories

- repo root — the entire package source: `logo.ts`, `generate.ts`, `rasterize.js`, `logo-anim.js`,
  `logo-anim.d.ts`, `index.html`, `README.md`, `LICENSE` (plus `package.json`, `tsconfig.json`,
  `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.gitignore`)
- `dist/` — generated artifacts: 12 tracked SVGs + 6 untracked PNGs (`*.png` is gitignored). Never
  hand-edit.
- `demo/` — a subproject of this repo, outside this file's scope: `demo/AGENTS.md` owns its layout,
  toolchain and rules.
- Absent on purpose at the repo root: no `src/`, `scripts/`, `docs/`, `.github/`, no test directory,
  no `.gitattributes`.

## Development Commands

Package (run from the repo root):

```bash
pnpm install            # the only install step (pnpm 11.x; pnpm-workspace.yaml allows sharp's build)
pnpm run generate       # or: node generate.ts — rewrites ./dist
bun generate.ts         # equivalent; both run .ts through type stripping
npm pack --dry-run      # inspect the published file list (18 files, ~9.7 kB) without writing a tarball
git diff --stat dist/   # the de-facto regression check
```

- Root has exactly two scripts: `generate` (`node generate.ts`) and `prepublishOnly`
  (`node generate.ts && git diff --exit-code -- dist`). There is **no** `build`, `test`, `lint`,
  `typecheck` or `format` script in the package. (`demo/AGENTS.md` documents the demo's own scripts.)
- Serving the root gallery needs a static file server. `file://` fails: `index.html` uses a module
  script and `<logo-anim>` uses `fetch`.

## Code Conventions & Common Patterns

- Formatting: 2-space indent, double quotes, semicolons, trailing commas, ~100 columns. Enforced by
  habit only — there is no formatter.
- Line endings (verified): only `generate.ts` is **CRLF** in the worktree; every other tracked file is
  **LF**. There is no `.gitattributes`, and this checkout runs Git for Windows' default
  `core.autocrlf=true`, so the index holds LF for both — a re-checkout will not reproduce that CRLF.
  Don't reflow `generate.ts`, and don't rely on `core.autocrlf`.
- The split is one-way: `generate.ts` imports `logo.ts`, `logo.ts` imports nothing — no `node:*`, no
  `sharp`. Keeping the builders dependency-free is what makes them importable from a throwaway script
  without touching `dist/`.
- Everything the package ships and a consumer runs is **plain JavaScript** (`logo-anim.js`,
  `rasterize.js`): Node refuses to strip types under `node_modules`
  (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`), so a shipped `.ts` entry cannot execute for a
  consumer. Keep `.ts` for the repo-only generator and `logo.ts`.
- Relative imports between the two TypeScript modules carry the `.ts` extension
  (`from "./logo.ts"`); Node ESM resolves specifiers literally and type stripping keys off that
  extension. Imports of shipped JS from TS use `.js` (`from "./rasterize.js"`).
- Naming:
  - artifacts `Logo{,_B,_BR,_Full,_Full_B,_Full_BR}.svg`, animated prefixed `Logo_Animated…`;
    `_B` = opaque white layer, `_BR` = that layer with `rx="100"`, no suffix = transparent.
  - CSS: lowercase, variant-namespaced — `.anim`, `.bar.blue`, `.glyph.n`, `.stage`, clip id
    `weave-slot`.
  - functions/consts: plain camelCase, tables plural (`bars`, `glyphs`, `variants`), booleans as
    options (`full`, `background`) with `round` for the layer radius.
- SVG emission: template literals with explicit per-level indentation (`iconMarkup(indent)`), one
  element per line, stable attribute order (`class, x, y, width, height, rx, fill`) so generated files
  diff cleanly.
- Comments explain *why* a mechanic exists (the weave patch, the entry runway, the pinwheel order);
  exported functions and data tables carry JSDoc.
- `logo-anim.js` patterns: private `#fields`, open shadow root, per-source `fetch` cache shared
  across instances, monotonic `#token` so a stale render cannot win, injected `#style` appended
  **after** the SVG (equal specificity, later wins) to override `.anim`, attributes as the source of
  truth with properties as thin accessors, invalid `speed` falls back to `1`, `alt` toggles
  `role="img"` + `aria-label` versus `aria-hidden="true"`, and
  `@media (prefers-reduced-motion: reduce)` freezes the timeline. Keep it dependency-free.
- `logo-anim.d.ts` mirrors the component's public surface **by hand** — attributes (`src`, `speed`,
  `paused`, `alt`), `play()` / `pause()` / `replay()`, and the `HTMLElementTagNameMap` entry. Change
  both files together.

## Important Files

- `logo.ts:182` `generateLogo({ full?, background?, round? })`, `logo.ts:213` / `logo.ts:231`
  `generateAnimatedLogo` / `generateAnimatedFullLogo({ background?, round? })` — the three pure string
  builders; `logo.ts:198` `animatedDocument(frame, body, children, options)` is the envelope they both
  emit, and `logo.ts:155` `animRule(total)` writes the single `.anim` duration.
- `generate.ts:17` `generateAll(outputDir)` plus its `variants` / `animated` tables (`:21`, `:35`) —
  the authoritative artifact list, repo-only; `generate.ts:52` the top-level call.
- `rasterize.js:37` `writePngs(outDir, { from, names })` — the single `sharp` call site, defaulting
  `from` to the package's own SVGs (`rasterize.js:17`) and `names` to `staticVariants`
  (`rasterize.js:20`); returns `false` after logging when `sharp` is unavailable.
- `logo.ts:41` / `:56` artwork tables, `:95` `cornerRadius`, `:76` `bars`, `:88` `overCell`, `:91` /
  `:92` `iconFrame` / `fullFrame` — the values to change when the mark itself changes.
- `logo-anim.js:31` `LogoAnim` (registered at `logo-anim.js:172`), `:20` shadow CSS (speed, reduced
  motion), `:33` `observedAttributes = ["src", "speed", "alt"]`; types in `logo-anim.d.ts:6`.
- `package.json` — see Packaging & Publishing below; `README.md` — bilingual, every gallery listed
  once; variant semantics (`README.md:24-28`), the component API table, install (`:30`), assets
  (`:42`), PNGs (`:60`) and the license summary (`:136`).
- `index.html` — the zero-dependency manual surface: galleries for all 12 artifacts (`:10-50`) plus 6
  live `<logo-anim>` instances with speed / Pause / Replay controls (`:51-87`).

## Packaging & Publishing

- Identity: `@sharpdotnut/logo`, `version` `0.1.0`, `"type": "module"` (`package.json:24`), scoped
  public publish via `"publishConfig": { "access": "public" }` — a scoped package is private by
  default. Repository/owner: `github.com/SharpDotNUT/SharpDotNUT-Logo`.
- `exports` (`package.json:25-35`): `.` → `logo-anim.js` (with `types` → `logo-anim.d.ts`),
  `./logo-anim.js`, `./rasterize.js` (the documented PNG entry point), `./*.svg` → `dist/*.svg` (so
  `@sharpdotnut/logo/Logo.svg` works), `./dist/*` → `./dist/*` (so the physical path also resolves),
  `./package.json`. The `.ts` sources are deliberately **not** exported and not in `files`.
- `files` (`package.json:39-44`): `rasterize.js`, `logo-anim.js`, `logo-anim.d.ts`, `dist/*.svg`.
  Verified payload: **18 files, ~9.7 kB packed** (README/LICENSE/package.json added by npm; no PNG, no
  `.ts`, no `index.html`, no `demo/`, no CLI).
- `sharp` is an **optional peer** (`package.json:52-59` + `peerDependenciesMeta`) and a devDependency
  (`^0.34.5`): consumers who only want the assets or the component install nothing. `rasterize.js`
  loads it through a dynamic `await import("sharp")` in a `try`, because a static import would throw
  at load time on a machine without the native binary.
- `scripts.prepublishOnly` (`package.json:45-48`) regenerates `dist/` and fails the publish if the
  committed SVGs drift (`git diff --exit-code -- dist`) — publish from a clean tree. PNGs are
  gitignored, so they never appear in that diff.
- License is not SPDX: `"license": "SEE LICENSE IN LICENSE"` (`package.json:14`) with the
  English-only brand policy in `LICENSE`: use/display/reference/redistribute the mark as-is
  (commercial use allowed, attribution not required), but never modify, recolour, distort, split,
  recombine, imply endorsement, or register it as a trademark/domain/account. Publishing needs write
  access to the `@sharpdotnut` npm org; the name is unclaimed on the registry as of 2026-09.

## Runtime/Tooling Preferences

- Runtime: Node ≥ 24 for the repo's direct `.ts` execution (Node 24.14 verified here; Bun 1.3.x also
  works). Type stripping requires ≥ 22.6 (experimental) / ≥ 23.6 (default). The published files are
  plain JS, so consumers are not held to that floor. ESM only; `"type": "module"` is set, so no
  `MODULE_TYPELESS_PACKAGE_JSON` warning appears.
- Package manager: pnpm 11.x. `pnpm-workspace.yaml` is **settings-only** (`allowBuilds: sharp: true`,
  required for sharp's native binary) — it declares no `packages`. Neither `package.json` declares
  `engines`, `packageManager` or `volta`; don't assume a pinned toolchain.
- Root `tsconfig.json` is editor-typing only (`noEmit`, `nodenext`, `allowJs`,
  `allowImportingTsExtensions`, non-strict) — nothing reads it at runtime.
- Environment: a Windows checkout (`core.ignorecase=true`, `core.filemode=false`); don't rely on
  POSIX-only tooling or on case-sensitive paths. Note that `.bin` shims are `.cmd` on Windows — drive
  tooling through `pnpm run <script>` rather than invoking `node_modules/.bin/*` directly.

## Testing & QA

- No test framework, no spec files, no CI, no linter. Verification means regenerating, packing and
  reading the diff.
- **Golden files:** the 12 tracked `dist/*.svg` are the regression baseline. After any change that is
  not meant to alter output, `pnpm run generate && git diff --stat dist/` must be empty. A non-empty
  diff is a review artefact: explain it or revert it.
- Because `logo.ts` is side-effect free, the builders can be compared against the committed artifacts
  without writing anything — run from the repo root (verified passing):

  ```bash
  node --input-type=module -e "const fs=await import('node:fs/promises'),m=await import('./logo.ts');\
  console.log(m.generateLogo()===await fs.readFile('dist/Logo.svg','utf8'))"
  ```

  It prints `true`, and `git status --porcelain dist/` stays empty. Extend the same one-liner to any
  variant by passing its options (`{full:true, background:true, round:m.cornerRadius}`) and to the
  animated builders.
- PNGs are gitignored, so they never appear in diffs — hash them instead (`sha256sum dist/*.png`):
  `rasterize.js` must keep producing byte-identical PNGs, and the same module must give a consumer the
  same bytes as the repo.
- Packaging: `npm pack --dry-run` must list **18 files** (no PNG, no `.ts`, no `index.html`, no demo,
  no CLI). For a full consumer smoke test, pack into a temp dir, install the tarball in a throwaway
  project, then check `import.meta.resolve("@sharpdotnut/logo")` and
  `("@sharpdotnut/logo/Logo.svg")`, import the installed `@sharpdotnut/logo/rasterize.js` and call
  `writePngs(dir)` — without `sharp` it must log that it skipped the PNGs and still return `false`,
  with `sharp` resolvable it must write 6 PNGs byte-identical to `dist/*.png`.
- Static↔animated equivalence is the second check when shape data changes: strip the `<style>` block
  from an animated variant and its `<rect>` bars sit at the settled frame, which must match the
  corresponding static file geometrically (markup differs: `rect` vs `path`).
- Root `index.html` served over http is the manual surface: galleries for every artifact, plus six
  live component instances driven by the speed slider, Pause/Resume and Replay.
- Adding a variant means editing in lockstep: the `variants` / `animated` tables (`generate.ts:21`,
  `:35`), the README gallery (`README.md:6-12`, `:16-22`) **and both language paragraphs** of its
  prose, and every gallery section of `index.html` (lines 10-87, including one component instance per
  animated variant).
