<script setup lang="ts">
import type { LogoAnim } from "@sharpdotnut/logo";
import { onMounted, ref, watch } from "vue";
import { animatedIconUrl } from "../data/mark";
import { t } from "../i18n";
import CodeBlock from "./ui/CodeBlock.vue";

const SNIPPET = `<script type="module">
  import "@sharpdotnut/logo"; // registers <logo-anim>
  import animated from "@sharpdotnut/logo/Logo_Animated_Full.svg";

  const logo = document.querySelector("logo-anim");
  logo.src = animated;
  logo.speed = 2;
  logo.replay();
<\/script>

<logo-anim alt="SharpDotNUT" style="width: 210px"></logo-anim>`;

const logoEl = ref<LogoAnim | null>(null);
const speed = ref(1);
const paused = ref(false);

onMounted(() => {
  if (logoEl.value) logoEl.value.speed = speed.value;
});

watch(speed, (value) => {
  if (logoEl.value) logoEl.value.speed = value;
});

function toggle(): void {
  paused.value = !paused.value;
  if (logoEl.value) logoEl.value.paused = paused.value;
}

function replay(): void {
  paused.value = false;
  logoEl.value?.replay();
}
</script>

<template>
  <section id="component" class="component">
    <header class="wrap section__head" data-reveal>
      <h2 class="section__title">{{ t("component.title") }}</h2>
      <p class="section__lede">{{ t("component.lede") }}</p>
    </header>

    <div class="wrap component__grid" data-reveal>
      <div class="component__demo">
        <logo-anim ref="logoEl" :src="animatedIconUrl" alt="SharpDotNUT" />
      </div>

      <div class="component__panel">
        <label class="component__control">
          <span class="component__label">
            {{ t("component.speed") }}
            <span class="component__value">{{ speed.toFixed(2) }}×</span>
          </span>
          <input v-model.number="speed" type="range" min="0.25" max="4" step="0.25" />
        </label>

        <div class="component__buttons">
          <button class="btn btn--ghost" type="button" @click="toggle">
            {{ paused ? t("component.resume") : t("component.pause") }}
          </button>
          <button class="btn btn--ghost" type="button" @click="replay">
            {{ t("component.replay") }}
          </button>
        </div>

        <p class="component__note">{{ t("component.note") }}</p>

        <CodeBlock label="<logo-anim>" lang="html" :code="SNIPPET" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.component__grid {
  display: grid;
  grid-template-columns: minmax(0, 280px) minmax(0, 1fr);
  gap: var(--space-7);
  align-items: center;
}

.component__demo {
  justify-self: center;
}

.component__demo logo-anim {
  display: block;
  width: min(280px, 60vw);
}

.component__panel {
  display: grid;
  gap: var(--space-4);
}

.component__control {
  display: grid;
  gap: var(--space-2);
}

.component__label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--muted);
}

.component__value {
  font-family: var(--font-mono);
}

.component__buttons {
  display: flex;
  gap: var(--space-3);
}

.component__note {
  color: var(--muted);
  font-size: 13px;
}

@media (max-width: 900px) {
  .component__grid {
    grid-template-columns: 1fr;
  }
}
</style>
