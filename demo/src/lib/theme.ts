import { computed, ref } from "vue";
import type { ComputedRef, Ref } from "vue";

/**
 * Theme is a three-state choice: `system` follows `prefers-color-scheme`, the other two pin it.
 * `index.html` runs the same logic before the first paint so the page never flashes.
 */
export type ThemeChoice = "system" | "light" | "dark";

const STORAGE_KEY = "logo-demo-theme";
const query = window.matchMedia("(prefers-color-scheme: dark)");

function read(): ThemeChoice {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

export const themeChoice: Ref<ThemeChoice> = ref(read());

export const effectiveTheme: ComputedRef<"light" | "dark"> = computed(() =>
  themeChoice.value === "system" ? (query.matches ? "dark" : "light") : themeChoice.value,
);

function apply(): void {
  document.documentElement.dataset.theme = effectiveTheme.value;
}

export function setTheme(next: ThemeChoice): void {
  themeChoice.value = next;
  try {
    if (next === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // private mode: fall back to a session-only choice
  }
  apply();
}

query.addEventListener("change", () => {
  if (themeChoice.value === "system") apply();
});

apply();
