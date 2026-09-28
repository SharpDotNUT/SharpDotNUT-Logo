<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { animatedIconMarkup, barColor, barSide } from "../data/mark";
import { t } from "../i18n";
import type { MessageKey } from "../i18n";
import { gsap } from "../lib/gsap";
import { mountSvg } from "../lib/mount-svg";
import { readSteps } from "../lib/timeline";
import type { BarStep } from "../lib/timeline";

type StepState = "waiting" | "flying" | "landed";

/** Keys are looked up, not built by concatenation, so an unknown bar name degrades to its class name. */
const BAR_LABELS: Partial<Record<string, MessageKey>> = {
  orange: "bar.orange",
  green: "bar.green",
  yellow: "bar.yellow",
  blue: "bar.blue",
};

const STATE_LABELS: Record<StepState, MessageKey> = {
  waiting: "anatomy.state.waiting",
  flying: "anatomy.state.flying",
  landed: "anatomy.state.landed",
};

interface StepRow {
  name: string;
  color: string;
  label: string;
  state: StepState;
  stateLabel: string;
  meta: string;
}

const root = ref<HTMLElement>();
const track = ref<HTMLElement>();
const stage = ref<HTMLElement>();
const cell = ref<HTMLElement>();

/** Scrub position in seconds; the SVG's own keyframes are the timeline being scrubbed. */
const progress = ref(0);
const total = ref(0);
const steps = ref<BarStep[]>([]);

const rows = computed<StepRow[]>(() =>
  steps.value.map((step) => {
    const state: StepState =
      progress.value < step.launch ? "waiting" : progress.value >= step.land ? "landed" : "flying";
    const label = BAR_LABELS[step.name];
    return {
      name: step.name,
      color: barColor[step.name] ?? "currentColor",
      label: label ? t(label) : step.name,
      state,
      stateLabel: t(STATE_LABELS[state]),
      meta: t("anatomy.step.meta", {
        side: t(`side.${barSide[step.name]}`),
        pct: Math.round((step.land / total.value) * 100),
      }),
    };
  }),
);

let mm: ReturnType<typeof gsap.matchMedia> | undefined;

onMounted(() => {
  const stageEl = stage.value;
  const trackEl = track.value;
  const cellEl = cell.value;
  if (!stageEl || !trackEl || !cellEl) return;

  const svg = mountSvg(animatedIconMarkup, stageEl);
  if (!svg) return;
  const sample = svg.querySelector(".anim");
  if (!sample) return;

  // Read the clock the file ships instead of hard-coding 2 s.
  total.value = Number.parseFloat(getComputedStyle(sample).animationDuration) || 2;
  steps.value = readSteps(svg.querySelector("style")?.textContent ?? "", total.value);

  // Demo annotation, not part of the artwork: the weave cell, drawn on top.
  const outline = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  outline.setAttribute("x", "200");
  outline.setAttribute("y", "400");
  outline.setAttribute("width", "100");
  outline.setAttribute("height", "100");
  outline.setAttribute("fill", "none");
  outline.setAttribute("stroke", "currentColor");
  outline.setAttribute("stroke-width", "6");
  outline.setAttribute("stroke-dasharray", "400");
  outline.setAttribute("stroke-dashoffset", "400");
  outline.setAttribute("class", "cell-outline");
  svg.append(outline);

  mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const state = { t: 0 };
    const ctx = gsap.context(() => {
      const cellTl = gsap.timeline({ paused: true })
        .to(outline, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" })
        .from(cellEl, { autoAlpha: 0, y: 8, duration: 0.4 }, "<0.1");

      gsap.to(state, {
        t: total.value,
        ease: "none",
        onUpdate: () => {
          progress.value = state.t;
          svg.style.setProperty("--scrub", state.t.toFixed(3));
          const blueLand = steps.value.find((step) => step.name === "blue")?.land ?? total.value;
          if (state.t >= blueLand) cellTl.play();
          else cellTl.pause(0);
        },
        scrollTrigger: { trigger: trackEl, start: "top top", end: "bottom bottom", scrub: 0.4 },
      });
    }, root.value);

    return () => {
      ctx.revert();
      progress.value = 0;
      svg.style.setProperty("--scrub", "0");
    };
  });

  mm.add("(prefers-reduced-motion: reduce)", () => {
    progress.value = total.value;
    svg.style.setProperty("--scrub", "99");
    return () => {
      progress.value = 0;
    };
  });
});

onBeforeUnmount(() => mm?.revert());
</script>

<template>
  <section id="anatomy" ref="root" class="anatomy">
    <header class="wrap section__head" data-reveal>
      <h2 class="section__title">{{ t("anatomy.title") }}</h2>
      <p class="section__lede">{{ t("anatomy.lede") }}</p>
    </header>

    <div ref="track" class="anatomy__track">
      <div class="anatomy__sticky wrap">
        <div ref="stage" class="anatomy__stage"></div>
        <div class="anatomy__panel">
          <p class="anatomy__clock">{{ t("anatomy.clock", { t: progress.toFixed(2) }) }}</p>
          <ol class="anatomy__steps">
            <li v-for="row in rows" :key="row.name" class="step" :data-state="row.state">
              <span class="step__chip" :style="{ '--chip': row.color }"></span>
              <span class="step__name">{{ row.label }}</span>
              <span class="step__state">{{ row.stateLabel }}</span>
              <span class="step__meta">{{ row.meta }}</span>
            </li>
          </ol>
          <p class="anatomy__hint">{{ t("anatomy.hint") }}</p>
        </div>
      </div>
    </div>

    <div class="wrap anatomy__facts">
      <span class="chip">{{ t("anatomy.fact.paint") }}</span>
      <span class="chip">{{ t("anatomy.fact.ease") }}</span>
      <span class="chip">{{ t("anatomy.fact.delay") }}</span>
    </div>

    <article ref="cell" class="wrap anatomy__cell">
      <h3>{{ t("anatomy.weave.title") }}</h3>
      <p>{{ t("anatomy.weave.body") }}</p>
    </article>
  </section>
</template>

<style scoped>
.anatomy__track {
  height: 320vh;
}

.anatomy__sticky {
  position: sticky;
  top: var(--nav-h);
  min-height: calc(100vh - var(--nav-h));
  display: grid;
  grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
  gap: var(--space-7);
  align-items: center;
}

.anatomy__stage {
  position: relative;
  width: min(52vh, 78vw);
  justify-self: center;
  color: var(--text);
}

.anatomy__stage svg {
  display: block;
  width: 100%;
  height: auto;
}

/* Scrub: the SVG's own keyframes stay the source of truth — only its clock is driven. */
.anatomy__stage :deep(.anim) {
  animation-play-state: paused;
  animation-delay: calc(var(--scrub, 0) * -1s);
}

.anatomy__panel {
  display: grid;
  gap: var(--space-4);
  align-content: center;
}

.anatomy__clock {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--muted);
}

.step {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-2) var(--space-3);
  align-items: center;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
}

.step[data-state="waiting"] {
  opacity: 0.45;
}

.step[data-state="landed"] .step__state {
  color: var(--muted);
}

.step__chip {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: var(--chip);
}

.step__state {
  font-size: 12px;
}

.step__meta {
  grid-column: 2 / -1;
  color: var(--muted);
  font-size: 12px;
}

.anatomy__hint {
  color: var(--muted);
  font-size: 12px;
}

.anatomy__facts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-7);
}

.anatomy__cell {
  margin-top: var(--space-5);
  padding: var(--space-5);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  max-width: 62ch;
}

.anatomy__cell p {
  margin-top: var(--space-2);
  color: var(--muted);
  font-size: 14px;
}

@media (max-width: 900px) {
  .anatomy__sticky {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .anatomy__track {
    height: auto;
    padding: var(--space-7) 0;
  }

  .anatomy__sticky {
    position: static;
    min-height: 0;
  }

  .anatomy__stage :deep(.cell-outline) {
    stroke-dashoffset: 0;
  }
}
</style>
