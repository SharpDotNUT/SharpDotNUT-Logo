<script setup lang="ts">
import { artifacts, pngUrl } from "../data/mark";
import { t } from "../i18n";

const GROUPS = [
  { key: "icon", items: artifacts.filter((artifact) => artifact.group === "icon") },
  { key: "full", items: artifacts.filter((artifact) => artifact.group === "full") },
] as const;
</script>

<template>
  <section id="variants" class="variants">
    <header class="wrap section__head" data-reveal>
      <h2 class="section__title">{{ t("variants.title") }}</h2>
      <p class="section__lede">{{ t("variants.lede") }}</p>
    </header>

    <div v-for="group in GROUPS" :key="group.key" class="wrap variants__group">
      <h3 data-reveal>{{ t(`variants.group.${group.key}`) }}</h3>
      <ul class="gallery" :class="`gallery--${group.key}`" data-reveal>
        <li v-for="artifact in group.items" :key="artifact.file" class="card">
          <div class="card__stage">
            <img
              :src="artifact.url"
              :alt="t('variants.alt', { file: artifact.file })"
              :width="artifact.width"
              :height="artifact.height"
              loading="lazy"
            />
          </div>
          <p class="card__name">{{ artifact.file }}</p>
          <p class="card__traits">
            <span class="chip">{{ t(`variants.kind.${artifact.kind}`) }}</span>
            <span class="chip">{{ t(`variants.layer.${artifact.layer}`) }}</span>
            <a
              v-if="artifact.kind === 'static'"
              class="chip card__png"
              :href="pngUrl(artifact.file)"
              target="_blank"
              rel="noopener"
              :aria-label="t('variants.png.label', { file: artifact.file })"
            >{{ t("variants.png") }}</a>
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.variants__group + .variants__group {
  margin-top: var(--space-8);
}

.variants__group h3 {
  margin-bottom: var(--space-4);
}

.gallery {
  display: grid;
  gap: var(--space-5);
}

.gallery--icon {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.gallery--full {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.card__stage {
  display: grid;
  place-items: center;
  padding: var(--space-5);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  transition: transform 160ms ease, border-color 160ms ease;
}

.card:hover .card__stage {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--text) 18%, transparent);
}

.gallery--icon .card__stage {
  aspect-ratio: 1 / 1;
}

.gallery--icon img {
  width: 62%;
  height: auto;
}

.gallery--full .card__stage {
  aspect-ratio: 3 / 1;
}

.gallery--full img {
  width: 88%;
  height: auto;
}

.card__name {
  margin-top: var(--space-3);
  font-family: var(--font-mono);
  font-size: 12px;
}

.card__traits {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-2);
}

.card__png {
  color: var(--text);
  text-decoration: none;
  transition: border-color 160ms ease;
}

.card__png:hover,
.card__png:focus-visible {
  border-color: color-mix(in srgb, var(--text) 30%, transparent);
}
</style>
