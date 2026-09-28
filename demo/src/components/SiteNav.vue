<script setup lang="ts">
import logoIcon from "@sharpdotnut/logo/Logo.svg?url";
import { locale, setLocale, t } from "../i18n";
import type { Locale, MessageKey } from "../i18n";
import { setTheme, themeChoice } from "../lib/theme";
import type { ThemeChoice } from "../lib/theme";

defineProps<{ active: string }>();

const LINKS: { id: string; key: MessageKey }[] = [
  { id: "anatomy", key: "nav.anatomy" },
  { id: "variants", key: "nav.variants" },
  { id: "palette", key: "nav.palette" },
  { id: "component", key: "nav.component" },
  { id: "usage", key: "nav.usage" },
];

const LANGUAGES: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "zh", label: "中文" },
];

const THEMES: { value: ThemeChoice; key: MessageKey }[] = [
  { value: "system", key: "theme.system" },
  { value: "light", key: "theme.light" },
  { value: "dark", key: "theme.dark" },
];
</script>

<template>
  <header class="nav">
    <div class="wrap nav__inner">
      <a class="nav__brand" href="#top">
        <img :src="logoIcon" alt="" width="24" height="24" />
        <span>{{ t("nav.brand") }}</span>
      </a>

      <nav class="nav__links" aria-label="Sections">
        <a
          v-for="link in LINKS"
          :key="link.id"
          :href="`#${link.id}`"
          class="nav__link"
          :class="{ 'is-on': active === link.id }"
          :aria-current="active === link.id ? 'true' : undefined"
        >
          {{ t(link.key) }}
        </a>
      </nav>

      <div class="nav__controls">
        <div class="seg" role="group" :aria-label="t('locale.group')">
          <button
            v-for="item in LANGUAGES"
            :key="item.value"
            type="button"
            class="seg__btn"
            :class="{ 'is-on': locale === item.value }"
            :aria-pressed="locale === item.value"
            @click="setLocale(item.value)"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="seg" role="group" :aria-label="t('theme.group')">
          <button
            v-for="item in THEMES"
            :key="item.value"
            type="button"
            class="seg__btn"
            :class="{ 'is-on': themeChoice === item.value }"
            :aria-pressed="themeChoice === item.value"
            @click="setTheme(item.value)"
          >
            {{ t(item.key) }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 20;
  height: var(--nav-h);
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}

.nav__inner {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  height: 100%;
}

.nav__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 600;
  letter-spacing: -0.01em;
  text-decoration: none;
}

.nav__links {
  display: flex;
  gap: var(--space-4);
  margin-inline-end: auto;
}

.nav__link {
  color: var(--muted);
  font-size: 14px;
  text-decoration: none;
  transition: color 160ms ease;
}

.nav__link:hover,
.nav__link.is-on {
  color: var(--text);
}

.nav__controls {
  display: flex;
  gap: var(--space-2);
  margin-inline-start: auto;
}

.seg {
  display: inline-flex;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 2px;
}

.seg__btn {
  border: 0;
  border-radius: 999px;
  background: transparent;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
  white-space: nowrap;
}

.seg__btn.is-on {
  background: var(--surface-2);
  color: var(--text);
}

@media (max-width: 860px) {
  .nav__links {
    display: none;
  }
}

@media (max-width: 560px) {
  .seg__btn {
    padding: 4px 8px;
  }
}
</style>
