# Repository Guidelines

Brand asset source for **SharpDotNUT**, published as the npm package **`@sharpdotnut/logo`** — plus
the demo site that showcases it. Both live in this repository, with different rules and toolchains:

1. **The package (repo root) — Part 1.** Four hand-written sources emit the logo as SVG (`logo.ts`
   builds the strings, `generate.ts` writes them, `rasterize.js` renders the PNGs) and one
   dependency-free web component (`logo-anim.js` + `logo-anim.d.ts`) plays the animated variants on a
   page. `dist/` is committed output: its 12 SVGs are the deliverable and the package payload, its 6
   PNGs are build leftovers.
2. **The demo site (`demo/`) — Part 2.** A versioned subproject of this repository: a static
   single-page gallery that consumes the package the way a real consumer does. It has its own
   toolchain, its own install and its own lockfile.

The package has **no runtime dependency**, no build step, no bundler, no test runner, no linter and
no CI. That is a statement about the package alone; `demo/` is not covered by it.

## The Boundary Between the Two Parts

- `demo/` sits inside this repository, is versioned with it and is **part of this project** — not a
  standalone repository, not a separate package, and **never published**. Package workflows
  (`prepublishOnly`, the `dist` drift check, `npm pack`) never cover or publish `demo/`.
- **Do not cross the boundary without being asked:** package work must not modify `demo/`; demo work
  must not modify the repo root. Anything outside the part you are working in is off-limits unless the
  user explicitly asks for it.
- Concretely off-limits from `demo/`: every package file at the repo root — `logo.ts`, `generate.ts`,
  `rasterize.js`, `logo-anim.js`, `logo-anim.d.ts`, `dist/**`, `index.html`, `README.md`, `AGENTS.md`,
  `package.json`, `tsconfig.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `LICENSE`, `.gitignore`.
  Never run the parent's scripts from `demo/` (`generate`, `prepublishOnly`, `npm pack`): they rewrite
  `dist/` and gate a publish, which is not the demo's business.
- If a demo task looks like it *needs* a parent-side change — a new SVG variant, a new export, a fix
  in `logo-anim.js`, a different `viewBox` — **stop and ask**. Do not "helpfully" patch the package.
- Nothing in `demo/` may be used as a check on the package: never regenerate `dist/`, never run the
  `dist/` drift check, never `npm pack` from `demo/`. If the demo reveals a package defect, report it —
  changing it needs explicit approval.
- The package is consumed the way a real consumer consumes it: `"@sharpdotnut/logo": "link:.."`
  (`demo/package.json:10`), imported by package specifier only. There are **no relative imports into
  the parent** anywhere in `demo/src`, and there must not be: exercising the published surface, not
  the source, is the whole point of the subproject. Which specifiers resolve, and to what, is the
  package's own business — Part 1 documents it.

## Part 1 — The Package (Repo Root)

### Project Overview

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

### Architecture & Data Flow

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

### Key Directories

- repo root — the entire package source: `logo.ts`, `generate.ts`, `rasterize.js`, `logo-anim.js`,
  `logo-anim.d.ts`, `index.html`, `README.md`, `LICENSE` (plus `package.json`, `tsconfig.json`,
  `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.gitignore`)
- `dist/` — generated artifacts: 12 tracked SVGs + 6 untracked PNGs (`*.png` is gitignored). Never
  hand-edit.
- `demo/` — the demo subproject; Part 2 below owns its layout, toolchain and rules.
- Absent on purpose at the repo root: no `src/`, `scripts/`, `docs/`, `.github/`, no test directory,
  no `.gitattributes`.

### Development Commands

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
  `typecheck` or `format` script in the package. (Part 2 documents the demo's own scripts.)
- Serving the root gallery needs a static file server. `file://` fails: `index.html` uses a module
  script and `<logo-anim>` uses `fetch`.

### Code Conventions & Common Patterns

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

### Important Files

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

### Packaging & Publishing

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

### Runtime/Tooling Preferences

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

### Testing & QA

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

## Part 2 — The Demo Site (`demo/`)

Everything under `demo/`, and nothing else. Paths in this part are relative to `demo/` unless they
start with `../` (the repo root, Part 1).

### Project Overview

A single-page gallery/marketing site that demonstrates the logo package: hero, anatomy (the entry
timeline scrubbed on scroll), the 12-artifact variants grid, an interactive colour palette, a live
`<logo-anim>` playground, usage snippets and a footer. Static SPA — no backend, no routing, no state
library, no server-side rendering.

- Stack: Vite 8, Vue 3.5 (`<script setup>` SFCs), TypeScript 5.9 via `vue-tsc`, gsap 3 (ScrollTrigger)
  for motion, shiki 4 for the code blocks. Installed with pnpm; `demo/node_modules` and `demo/dist`
  are gitignored, the lockfile is not.

### Architecture & Data Flow

`demo/index.html` (inline pre-paint script sets `data-theme` + `lang` from `localStorage` to avoid a
flash) → `src/main.ts` (imports `@sharpdotnut/logo` for the side effect that registers `<logo-anim>`,
mounts `App`, pulls in `styles/tokens.css` + `styles/base.css`) → `src/App.vue` (`SiteNav`, six
`*Section.vue`, `SiteFooter`; owns the gsap reveal pass and the `IntersectionObserver` scroll-spy).

- `src/data/mark.ts` — the single artifact/colour table: 12 entries imported from the package with
  `?url`, the four bar colours/sides, `?raw` markup, plus the icon/full intrinsic sizes. It **mirrors
  `../logo.ts` by hand** (nothing is shared); an artwork change must be repeated here.
- `src/lib/gsap.ts` — the only place `gsap.registerPlugin(ScrollTrigger)` runs; every component
  imports gsap from here.
- `src/lib/theme.ts` — module-singleton theme store (`system | light | dark`, `localStorage`
  `logo-demo-theme`) writing `data-theme` on `<html>`; mirrored by the inline script in `index.html`.
- `src/lib/timeline.ts` — `readSteps()` parses `@keyframes enter-*` out of the shipped animated SVG's
  own `<style>`, so scrub timings come from the artifact rather than duplicated numbers.
- `src/lib/mount-svg.ts` — `DOMParser`-based inline injection; adds the `viewBox` the static build
  omits and sets `aria-hidden="true"`.
- `src/lib/shiki.ts` — lazy shared highlighter (`shiki/core` + JS regex engine, no wasm), vitesse
  light/dark, results cached by `lang + code`.
- `src/i18n/index.ts` — hand-rolled i18n (no vue-i18n): `LOCALES = ["en","zh"]`, flat dot-namespaced
  keys, `t(key, vars)` with `{placeholder}` interpolation; `zh` is typed `Record<MessageKey, string>`,
  so a missing translation is a type error. Bilingual copy is **English first, Chinese second**.
- `vite.config.ts` — `vue()` with `isCustomElement: tag === "logo-anim"` (so the package's element is
  not treated as a Vue component), `server.port` from `$PORT` else 5173, and `assetsInlineLimit: 0` so
  the SVGs stay real files for `<logo-anim src>` to fetch.

### Key Directories

- `src/components/` — `SiteNav`, `SiteFooter`, `HeroSection`, `AnatomySection`, `VariantsSection`,
  `PaletteSection`, `ComponentSection`, `UsageSection`; `src/components/ui/` for reusable widgets
  (`CodeBlock.vue`).
- `src/lib/` — the six modules listed above. `src/data/` — `mark.ts`. `src/i18n/` — the copy tables.
- `src/styles/` — `tokens.css` (design tokens; dark values on `:root`, light in a
  `[data-theme="light"]` override) + `base.css` (globals, `.wrap`/`.btn`/`.chip` utilities, the shiki
  dark hook, reduced-motion resets). Imported only by `main.ts`.
- `dist/` — gitignored Vite build output with content-hashed assets. Never commit it.
- Absent on purpose: no `public/`, no router, no store, no tests, no lint config, no CI.

### Development Commands

```bash
pnpm install     # installs ONLY the demo (its own lockfile); the parent is a separate install
pnpm dev         # vite dev server on $PORT, else 5173
pnpm typecheck   # vue-tsc --noEmit — the acceptance gate
pnpm build       # vue-tsc --noEmit && vite build → demo/dist
pnpm preview     # serve the built site
```

- Node ≥ 20.19 for Vite 8 / shiki 4 (Node 22+ in practice). pnpm only; the demo is **not** a pnpm
  workspace member, so run installs from `demo/`.
- Opening `demo/dist/index.html` over `file://` fails (absolute `/assets` URLs) — use `pnpm preview`.

### Code Conventions & Common Patterns

- Every SFC: `<script setup lang="ts">` + `<style scoped>`. No Options API, no `defineComponent`, no
  `defineEmits`; props are type-only (`defineProps<{ active: string }>()`) or `withDefaults(...)`.
- `import type { … }` for types — `verbatimModuleSyntax` is on.
- Components are PascalCase (`*Section.vue`, `Site*.vue`); non-component modules kebab-case or one
  word. Relative imports only — there are no path aliases.
- Styles reference design tokens (`var(--space-*)`, `var(--radius-*)`, `var(--surface*)`, `var(--line)`,
  `var(--muted)`, `var(--text)`, `var(--nav-h)`) and never raw colours; one-off values travel as inline
  custom properties (`:style="{'--swatch': hex}"`). Colour mixing uses `color-mix(...)`.
- Motion is always gated: `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` with
  `revert()` in `onBeforeUnmount`, plus explicit reduced-motion branches; `base.css` also zeroes
  `.anim` durations. `data-reveal` is the shared opt-in attribute for scroll reveals.
- Copy is bilingual and **English first**: add new strings to `src/i18n/index.ts` in both locales (the
  `zh` table is type-checked, so a missing key fails `pnpm typecheck`). Chinese is used for text, not
  for identifiers.
- Accessibility is deliberate: injected SVGs are `aria-hidden`, decorative images use `alt=""`,
  controls carry `aria-label`/`aria-pressed`/`aria-current`, and hover effects are mirrored on focus.

### Important Files

- `vite.config.ts` — plugin, port, `assetsInlineLimit`. `tsconfig.json` — strict + bundler resolution.
- `src/main.ts` — the only bootstrap; `src/App.vue` — section order + scroll behaviour.
- `src/data/mark.ts` — the artifact taxonomy. Change it whenever the package's artifact list changes
  (`generate.ts` at the repo root authors that list; its tables and semantics are documented in Part 1).
- `src/components/ComponentSection.vue` — drives `<logo-anim>` (`speed`, `paused`, `replay()`) and is
  the closest thing to a consumer smoke test for the component API.
- `src/i18n/index.ts` — all user-visible strings. `src/styles/tokens.css` — the visual contract.
- `package.json` — deliberately has no `name`/`version`; do not add package identity.

### Testing & QA

- There is **no test framework** here, and none is expected: the gate is `pnpm typecheck` (verified
  clean) followed by `pnpm build`, which proves the site still compiles and bundles against the
  installed package.
- Do **not** open a browser by default. Type checking, the build output and reading
  `demo/dist/assets/*` are the first-line evidence; only go visual when the change is genuinely about
  layout/interaction and no lighter check can settle it.
- Nothing in `demo/` may be used as a check on the parent package: never regenerate `../dist`, never
  run the parent's `dist/` drift check, never `npm pack` from here. If the demo reveals a package
  defect, report it — changing it needs explicit approval.
