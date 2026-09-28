<script setup lang="ts">
import { t } from "../i18n";

const LINKS = [
  { key: "footer.repo", href: "https://github.com/SharpDotNUT/SharpDotNUT-Logo" },
  { key: "footer.npm", href: "https://www.npmjs.com/package/@sharpdotnut/logo" },
  {
    key: "footer.license",
    href: "https://github.com/SharpDotNUT/SharpDotNUT-Logo/blob/main/LICENSE",
  },
] as const;
</script>

<template>
  <footer class="foot">
    <div class="wrap foot__inner">
      <p class="foot__brand">{{ t("nav.brand") }} · 0.1.0</p>
      <p class="foot__license">{{ t("usage.license.body") }}</p>
      <p class="foot__links">
        <a v-for="link in LINKS" :key="link.key" :href="link.href" rel="noreferrer">
          {{ t(link.key) }}
        </a>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.foot {
  border-top: 1px solid var(--line);
  padding: var(--space-8) 0;
}

.foot__inner {
  display: grid;
  gap: var(--space-4);
  max-width: 62ch;
}

.foot__brand {
  font-weight: 600;
}

.foot__license {
  color: var(--muted);
  font-size: 14px;
}

.foot__links {
  display: flex;
  gap: var(--space-4);
  font-size: 14px;
}

.foot__links a {
  color: var(--muted);
}

.foot__links a:hover {
  color: var(--text);
}
</style>
