<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import AnatomySection from "./components/AnatomySection.vue";
import ComponentSection from "./components/ComponentSection.vue";
import HeroSection from "./components/HeroSection.vue";
import PaletteSection from "./components/PaletteSection.vue";
import SiteFooter from "./components/SiteFooter.vue";
import SiteNav from "./components/SiteNav.vue";
import UsageSection from "./components/UsageSection.vue";
import VariantsSection from "./components/VariantsSection.vue";
import { gsap } from "./lib/gsap";

const SECTION_IDS = ["anatomy", "variants", "palette", "component", "usage"] as const;

const active = ref("");
let observer: IntersectionObserver | undefined;
let mm: ReturnType<typeof gsap.matchMedia> | undefined;

onMounted(() => {
  mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
      gsap.from(el, {
        y: 28,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
  });

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) active.value = entry.target.id;
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  for (const id of SECTION_IDS) {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
  mm?.revert();
});
</script>

<template>
  <SiteNav :active="active" />
  <main>
    <HeroSection />
    <AnatomySection />
    <VariantsSection />
    <PaletteSection />
    <ComponentSection />
    <UsageSection />
  </main>
  <SiteFooter />
</template>
