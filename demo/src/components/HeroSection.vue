<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { fullLogoRoundedUrl, fullLogoUrl } from "../data/mark";
import { t } from "../i18n";
import { copyText } from "../lib/clipboard";
import { gsap } from "../lib/gsap";
import { effectiveTheme } from "../lib/theme";

const INSTALL = "npm install @sharpdotnut/logo";

const root = ref<HTMLElement>();
const copied = ref(false);

// The wordmark is black: on a dark page the transparent full logo loses its `.NUT`, so the
// `_BR` file (white rounded layer, shipped as-is) is the correct variant there.
const logoSrc = computed(() => (effectiveTheme.value === "dark" ? fullLogoRoundedUrl : fullLogoUrl));

async function copyInstall(): Promise<void> {
  if (!(await copyText(INSTALL))) return;
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1200);
}

let mm: ReturnType<typeof gsap.matchMedia> | undefined;

onMounted(() => {
  mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
      tl.from(".hero__logo", { autoAlpha: 0, scale: 0.97, duration: 1.1 })
        .from(".hero__title", { y: 20, autoAlpha: 0 }, "-=0.75")
        .from(".hero__lede", { y: 16, autoAlpha: 0 }, "-=0.6")
        .from(".hero__actions", { y: 12, autoAlpha: 0 }, "-=0.55")
        .from(".hero__facts li", { y: 10, autoAlpha: 0, stagger: 0.06 }, "-=0.5")
        .from(".hero__note", { autoAlpha: 0, duration: 0.6 }, "-=0.4");
    }, root.value);
    return () => ctx.revert();
  });
});

onBeforeUnmount(() => mm?.revert());
</script>

<template>
  <section id="top" ref="root" class="hero">
    <div class="wrap hero__inner">
      <div class="hero__logo">
        <logo-anim :src="logoSrc" alt="SharpDotNUT" />
      </div>
      <h1 class="hero__title">{{ t("hero.title") }}</h1>
      <p class="hero__lede">{{ t("hero.lede") }}</p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="#anatomy">{{ t("hero.cta.anatomy") }}</a>
        <button class="btn btn--ghost" type="button" @click="copyInstall">
          {{ copied ? t("hero.cta.copied") : t("hero.cta.copy") }}
        </button>
      </div>
      <ul class="hero__facts">
        <li class="chip">{{ t("hero.facts.icon") }}</li>
        <li class="chip">{{ t("hero.facts.full") }}</li>
        <li class="chip">{{ t("hero.facts.unit") }}</li>
      </ul>
      <p class="hero__note">{{ t("hero.note") }}</p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: calc(var(--nav-h) + var(--space-8)) 0 var(--space-8);
  text-align: center;
  background-image: radial-gradient(
    60% 50% at 50% 0%,
    color-mix(in oklab, var(--mark-blue) 12%, transparent),
    transparent 70%
  );
}

.hero__inner {
  display: grid;
  justify-items: center;
  gap: var(--space-5);
}

.hero__logo logo-anim {
  display: block;
  width: min(760px, 92vw);
}

.hero__title {
  max-width: 18ch;
  font-size: clamp(32px, 5vw, 56px);
}

.hero__lede {
  max-width: 56ch;
  color: var(--muted);
  font-size: clamp(15px, 1.6vw, 18px);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
}

.hero__facts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
}

.hero__note {
  max-width: 62ch;
  margin-top: var(--space-2);
  color: var(--muted);
  font-size: 13px;
}
</style>
