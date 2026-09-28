# Repository Guidelines — `demo/`

Scope: everything under `demo/`, and nothing else. Package-side details (artwork tables, `dist/`,
publishing, the repo's own tooling) live in `../AGENTS.md` — read that one before touching anything up
there, and never restate it here. The boundary is symmetric: `../AGENTS.md` owns the package and does
not describe `demo/`.

## Project Relationship

- **This project is always a subdirectory of the parent directory.** `demo/` sits inside
  `SharpDotNUT-Logo/` (the npm package `@sharpdotnut/logo`), is versioned with it, and is **part of
  that parent project** — not a standalone repository, not a separate package, never published.
- **Normal work must not touch the parent directory.** Change only files under `demo/`. Anything
  outside it is off-limits unless the user explicitly asks for it.
- Concretely off-limits: `../logo.ts`, `../generate.ts`, `../rasterize.js`, `../logo-anim.js`,
  `../logo-anim.d.ts`, `../dist/**`, `../index.html`, `../README.md`, `../AGENTS.md`,
  `../package.json`, `../tsconfig.json`, `../pnpm-lock.yaml`, `../pnpm-workspace.yaml`, `../LICENSE`,
  `../.gitignore`. Never run the parent's scripts from here (`generate`, `prepublishOnly`, `npm
  pack`): they rewrite `../dist` and gate a publish, which is not the demo's business.
- If a demo task looks like it *needs* a parent-side change — a new SVG variant, a new export, a fix
  in `logo-anim.js`, a different `viewBox` — **stop and ask**. Do not "helpfully" patch the package.
- The package is consumed the way a real consumer consumes it: `"@sharpdotnut/logo": "link:.."`
  (`demo/package.json:10`), imported by package specifier only. There are **no relative imports into
  the parent** anywhere in `demo/src`, and there must not be: exercising the published surface, not
  the source, is the whole point of this subproject. Which specifiers resolve, and to what, is the
  package's own business — `../AGENTS.md` documents it.

## Project Overview

A single-page gallery/marketing site that demonstrates the logo package: hero, anatomy (the entry
timeline scrubbed on scroll), the 12-artifact variants grid, an interactive colour palette, a live
`<logo-anim>` playground, usage snippets and a footer. Static SPA — no backend, no routing, no state
library, no server-side rendering.

- Stack: Vite 8, Vue 3.5 (`<script setup>` SFCs), TypeScript 5.9 via `vue-tsc`, gsap 3 (ScrollTrigger)
  for motion, shiki 4 for the code blocks. Installed with pnpm; `demo/node_modules` and `demo/dist`
  are gitignored, the lockfile is not.

## Architecture & Data Flow

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

## Key Directories

- `src/components/` — `SiteNav`, `SiteFooter`, `HeroSection`, `AnatomySection`, `VariantsSection`,
  `PaletteSection`, `ComponentSection`, `UsageSection`; `src/components/ui/` for reusable widgets
  (`CodeBlock.vue`).
- `src/lib/` — the six modules listed above. `src/data/` — `mark.ts`. `src/i18n/` — the copy tables.
- `src/styles/` — `tokens.css` (design tokens; dark values on `:root`, light in a
  `[data-theme="light"]` override) + `base.css` (globals, `.wrap`/`.btn`/`.chip` utilities, the shiki
  dark hook, reduced-motion resets). Imported only by `main.ts`.
- `dist/` — gitignored Vite build output with content-hashed assets. Never commit it.
- Absent on purpose: no `public/`, no router, no store, no tests, no lint config, no CI.

## Development Commands

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

## Code Conventions & Common Patterns

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

## Important Files

- `vite.config.ts` — plugin, port, `assetsInlineLimit`. `tsconfig.json` — strict + bundler resolution.
- `src/main.ts` — the only bootstrap; `src/App.vue` — section order + scroll behaviour.
- `src/data/mark.ts` — the artifact taxonomy. Change it whenever the package's artifact list changes
  (`../generate.ts` authors that list; its tables and semantics are documented in `../AGENTS.md`).
- `src/components/ComponentSection.vue` — drives `<logo-anim>` (`speed`, `paused`, `replay()`) and is
  the closest thing to a consumer smoke test for the component API.
- `src/i18n/index.ts` — all user-visible strings. `src/styles/tokens.css` — the visual contract.
- `package.json` — deliberately has no `name`/`version`; do not add package identity.

## Testing & QA

- There is **no test framework** here, and none is expected: the gate is `pnpm typecheck` (verified
  clean) followed by `pnpm build`, which proves the site still compiles and bundles against the
  installed package.
- Do **not** open a browser by default. Type checking, the build output and reading
  `demo/dist/assets/*` are the first-line evidence; only go visual when the change is genuinely about
  layout/interaction and no lighter check can settle it.
- Nothing in `demo/` may be used as a check on the parent package: never regenerate `../dist`, never
  run the parent's `dist/` drift check, never `npm pack` from here. If the demo reveals a package
  defect, report it — changing it needs explicit approval.
