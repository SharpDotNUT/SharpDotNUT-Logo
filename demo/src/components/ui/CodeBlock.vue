<script setup lang="ts">
import { ref, watch } from "vue";
import { t } from "../../i18n";
import { copyText } from "../../lib/clipboard";
import { highlight } from "../../lib/shiki";
import type { CodeLang } from "../../lib/shiki";

const props = withDefaults(defineProps<{ code: string; label?: string; lang?: CodeLang }>(), {
  lang: "js",
});

const copied = ref(false);
const html = ref("");

// Highlighting is async (shiki loads lazily); the plain source shows first, then swaps in.
// `token` drops a stale result if `code`/`lang` change before the highlighter resolves.
let token = 0;
watch(
  [() => props.code, () => props.lang],
  ([code, lang]) => {
    const id = ++token;
    void highlight(code, lang).then((out) => {
      if (id === token) html.value = out;
    });
  },
  { immediate: true },
);

async function copy(): Promise<void> {
  if (!(await copyText(props.code))) return;
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1200);
}
</script>

<template>
  <figure class="code">
    <figcaption v-if="label" class="code__label">{{ label }}</figcaption>
    <pre class="code__pre"><code v-if="html" class="shiki" v-html="html"></code><code v-else>{{ code }}</code></pre>
    <button class="code__copy" type="button" @click="copy">
      {{ copied ? t("usage.copied") : t("usage.copy") }}
    </button>
  </figure>
</template>

<style scoped>
.code {
  position: relative;
  margin: 0;
  padding: var(--space-4);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.code__label {
  margin-bottom: var(--space-2);
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.code__pre {
  margin: 0;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.7;
}

.code__copy {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  padding: 2px 10px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
}

.code__copy:hover {
  color: var(--text);
}
</style>
