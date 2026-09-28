import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import type { HighlighterCore } from "shiki/core";

/**
 * Shiki, loaded once and shared. The fine-grained entry (`shiki/core`) plus explicit theme/grammar
 * imports keeps the bundle to the three languages this page shows; both themes are emitted at once
 * and selected in CSS off `data-theme` (the `--shiki-dark` custom property each token carries —
 * see `styles/base.css`). The JS regex engine avoids shipping the oniguruma wasm.
 */
export type CodeLang = "bash" | "js" | "html";

const THEMES = { light: "vitesse-light", dark: "vitesse-dark" } as const;

let highlighter: Promise<HighlighterCore> | undefined;

function load(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    themes: [import("shiki/themes/vitesse-light.mjs"), import("shiki/themes/vitesse-dark.mjs")],
    langs: [
      import("shiki/langs/bash.mjs"),
      import("shiki/langs/javascript.mjs"),
      import("shiki/langs/html.mjs"),
    ],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

const cache = new Map<string, string>();

/**
 * Returns the token markup for `code` (`<span>`s only), ready to inject into a `<code>` element.
 * Cached per language + source, so re-mounting a block or flipping the theme never re-highlights.
 */
export async function highlight(code: string, lang: CodeLang): Promise<string> {
  const key = `${lang}\u0000${code}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const shiki = await load();
  const html = shiki.codeToHtml(code, {
    lang,
    themes: THEMES,
    structure: "inline",
  });
  cache.set(key, html);
  return html;
}
