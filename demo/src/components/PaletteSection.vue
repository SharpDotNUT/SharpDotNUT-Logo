<script setup lang="ts">
import { onMounted, ref } from "vue";
import { bars, staticIconMarkup } from "../data/mark";
import { t } from "../i18n";
import { copyText } from "../lib/clipboard";
import { gsap } from "../lib/gsap";
import { mountSvg } from "../lib/mount-svg";

const mark = ref<HTMLElement>();
const copied = ref("");

let paths: SVGPathElement[] = [];

onMounted(() => {
  if (!mark.value) return;
  const svg = mountSvg(staticIconMarkup, mark.value);
  if (!svg) return;
  paths = [...svg.querySelectorAll<SVGPathElement>("path[fill]")];
});

/**
 * Isolation is opacity only — the artwork's fills are never touched (LICENSE §2). Four call sites
 * share this one tween, so the fade stays in lockstep.
 */
function isolate(hex: string | null): void {
  if (paths.length === 0) return;
  gsap.to(paths, {
    autoAlpha: (_index: number, el: SVGPathElement) =>
      !hex || el.getAttribute("fill") === hex ? 1 : 0.18,
    duration: 0.28,
    ease: "power2.out",
    overwrite: "auto",
  });
}

async function copyHex(hex: string): Promise<void> {
  if (!(await copyText(hex))) return;
  copied.value = hex;
  setTimeout(() => {
    copied.value = "";
  }, 1200);
}
</script>

<template>
  <section id="palette" class="palette-section">
    <header class="wrap section__head" data-reveal>
      <h2 class="section__title">{{ t("palette.title") }}</h2>
      <p class="section__lede">{{ t("palette.lede") }}</p>
    </header>

    <div class="wrap palette" data-reveal>
      <div ref="mark" class="palette__mark"></div>
      <ul class="palette__list">
        <li v-for="bar in bars" :key="bar.name">
          <button
            class="swatch"
            type="button"
            :style="{ '--swatch': bar.color }"
            :aria-label="t('palette.copy', { hex: bar.color })"
            @pointerenter="isolate(bar.color)"
            @pointerleave="isolate(null)"
            @focus="isolate(bar.color)"
            @blur="isolate(null)"
            @click="copyHex(bar.color)"
          >
            <span class="swatch__chip"></span>
            <span class="swatch__name">{{ t(`bar.${bar.name}`) }}</span>
            <span class="swatch__hex">
              {{ copied === bar.color ? t("palette.copied") : bar.color }}
            </span>
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.palette {
  display: grid;
  grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
  gap: var(--space-7);
  align-items: center;
}

.palette__mark svg {
  display: block;
  width: 100%;
  height: auto;
}

.palette__list {
  display: grid;
  gap: var(--space-3);
}

.swatch {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-4);
  background: var(--surface);
  border: 1px solid var(--line);
  border-left: 3px solid var(--swatch);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: start;
}

.swatch__chip {
  width: 16px;
  height: 16px;
  border-radius: 5px;
  background: var(--swatch);
}

.swatch__hex {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
}

@media (max-width: 900px) {
  .palette {
    grid-template-columns: 1fr;
  }
}
</style>
