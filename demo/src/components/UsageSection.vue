<script setup lang="ts">
import { t } from "../i18n";
import CodeBlock from "./ui/CodeBlock.vue";

const INSTALL = `npm install @sharpdotnut/logo     # or: pnpm add @sharpdotnut/logo / bun add @sharpdotnut/logo`;

const ASSETS = `import logoUrl from "@sharpdotnut/logo/Logo.svg"; // bundlers: Vite, webpack, esbuild…
// or read it straight from the package:
// node_modules/@sharpdotnut/logo/dist/Logo_BR.svg`;

const PNGS = `// build-logo-pngs.mjs — run once, or wire it into a prebuild step
import { writePngs } from "@sharpdotnut/logo/rasterize.js";

await writePngs("./public/brand"); // the 6 static PNGs

// needs sharp, which is optional:
// npm install --save-dev sharp`;
</script>

<template>
  <section id="usage" class="usage">
    <header class="wrap section__head" data-reveal>
      <h2 class="section__title">{{ t("usage.title") }}</h2>
      <p class="section__lede">{{ t("usage.lede") }}</p>
    </header>

    <div class="wrap usage__grid" data-reveal>
      <CodeBlock :label="t('usage.install')" lang="bash" :code="INSTALL" />
      <CodeBlock :label="t('usage.assets')" lang="js" :code="ASSETS" />
      <CodeBlock :label="t('usage.pngs')" lang="js" :code="PNGS" />

      <article class="license">
        <h3>{{ t("usage.license.title") }}</h3>
        <p>{{ t("usage.license.body") }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.usage__grid {
  display: grid;
  gap: var(--space-5);
  max-width: 720px;
}

.license {
  padding: var(--space-5);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.license p {
  margin-top: var(--space-3);
  color: var(--muted);
  font-size: 14px;
}
</style>
