import { ref } from "vue";

/**
 * Bilingual copy: English first, Chinese second — the convention every other document in this
 * repository follows. Both tables are flat; `zh` is typed against the English keys, so a missing
 * translation is a type error rather than an English string on a Chinese page.
 */

export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

const STORAGE_KEY = "logo-demo-locale";

const en = {
  "nav.anatomy": "Anatomy",
  "nav.variants": "Variants",
  "nav.palette": "Palette",
  "nav.component": "Component",
  "nav.usage": "Usage",
  "nav.brand": "SharpDotNUT",
  "theme.group": "Theme",
  "theme.system": "Auto",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "locale.group": "Language",
  "hero.title": "Twelve SVG files, one woven mark",
  "hero.lede":
    "Four bars fly in from the frame edges, a .NUT wordmark floats in beside them. Every file carries its own timeline; the component needs no dependency.",
  "hero.cta.anatomy": "See the anatomy",
  "hero.cta.copy": "Copy install command",
  "hero.cta.copied": "Copied",
  "hero.facts.icon": "icon 700 × 700",
  "hero.facts.full": "full 2100 × 700",
  "hero.facts.unit": "one unit = 100",
  "hero.note":
    "The wordmark is black, so dark pages use the _B / _BR files, which paint an opaque white layer behind the artwork.",
  "anatomy.title": "Anatomy",
  "anatomy.lede":
    "The icon is four bars flying in from the frame edges: 0.25 s apart, 1.25 s each. The timeline lives in the SVG's own <style> block as percentages, so one animation-duration rescales the whole flight.",
  "anatomy.clock": "t = {t} s",
  "anatomy.state.waiting": "waiting",
  "anatomy.state.flying": "in flight",
  "anatomy.state.landed": "landed",
  "anatomy.step.meta": "from the {side} · lands at {pct}%",
  "anatomy.weave.title": "The weave cell",
  "anatomy.weave.body":
    "Blue crosses over the orange column in a single 100-unit cell at (200, 400). Paint order draws orange last, so the file draws blue a second time, clipped to #weave-slot, to keep the weave.",
  "anatomy.fact.paint": "paint order = reverse arrival order",
  "anatomy.fact.ease": "cubic-bezier(0.22, 1, 0.36, 1) on every flight",
  "anatomy.fact.delay": "no animation-delay — one duration rescales everything",
  "anatomy.hint": "Scroll to scrub the timeline",
  "side.top": "the top",
  "side.right": "the right",
  "side.bottom": "the bottom",
  "side.left": "the left",
  "bar.orange": "orange",
  "bar.green": "green",
  "bar.yellow": "yellow",
  "bar.blue": "blue",
  "variants.title": "Variants",
  "variants.lede":
    'Six static and six animated files. _B paints an opaque white layer, _BR adds rx="100" to it — one design unit, the same as the bar thickness and the padding. The rest are transparent.',
  "variants.group.icon": "Icon",
  "variants.group.full": "Full logo",
  "variants.kind.static": "static",
  "variants.kind.animated": "animated",
  "variants.layer.none": "transparent",
  "variants.layer.white": "white layer",
  "variants.layer.rounded": "white layer, rx 100",
  "variants.alt": "SharpDotNUT logo: {file}",
  "palette.title": "Palette",
  "palette.lede":
    "Four bars carry the mark. Hover or focus a swatch to isolate it, click to copy the hex. The wordmark is always #000000.",
  "palette.copy": "Copy {hex}",
  "palette.copied": "Copied",
  "component.title": "Web component",
  "component.lede":
    "<logo-anim> loads one animated SVG into a shadow root and exposes speed, paused and replay(). An animated SVG inside an <img> is a separate document page CSS cannot reach.",
  "component.speed": "Speed",
  "component.pause": "Pause",
  "component.resume": "Resume",
  "component.replay": "Replay",
  "component.note":
    "The duration is read back from the SVG with getComputedStyle (2 s icon, 4 s full logo); speed is a multiplier on it.",
  "usage.title": "Install & use",
  "usage.lede":
    "The package ships 18 files (~10 kB packed): 12 SVGs, the component, its types and the PNG rasterizer. No runtime dependency, no CLI; sharp is optional and only needed for the PNGs.",
  "usage.install": "Install",
  "usage.assets": "Resolve an SVG by name",
  "usage.pngs": "Build the PNGs",
  "usage.copy": "Copy",
  "usage.copied": "Copied",
  "usage.license.title": "License",
  "usage.license.body":
    "Use, display, reference and share the logo as-is — including commercially — without attribution. No modification, recolouring, distortion, splitting or combining; no implied endorsement; no misleading or unlawful use; no trademark, domain or account registration. The artwork and the component code are covered by LICENSE (English only).",
  "footer.repo": "GitHub",
  "footer.license": "LICENSE",
  "footer.npm": "npm",
} as const;

export type MessageKey = keyof typeof en;

const zh: Record<MessageKey, string> = {
  "nav.anatomy": "构造",
  "nav.variants": "变体",
  "nav.palette": "配色",
  "nav.component": "组件",
  "nav.usage": "用法",
  "nav.brand": "SharpDotNUT",
  "theme.group": "主题",
  "theme.system": "跟随系统",
  "theme.light": "浅色",
  "theme.dark": "深色",
  "locale.group": "语言",
  "hero.title": "十二个 SVG 文件，一个编织的标志",
  "hero.lede": "四条色条从画面四边飞入，.NUT 字标在旁浮现。每个文件自带时间线，组件没有任何依赖。",
  "hero.cta.anatomy": "看构造",
  "hero.cta.copy": "复制安装命令",
  "hero.cta.copied": "已复制",
  "hero.facts.icon": "图标 700 × 700",
  "hero.facts.full": "完整 2100 × 700",
  "hero.facts.unit": "一个单位 = 100",
  "hero.note": "字标是黑色，所以深色页面用 _B / _BR 文件——它们在画面背后铺一层不透明白底。",
  "anatomy.title": "构造",
  "anatomy.lede":
    "图标由四条色条组成，自画面四边飞入：间隔 0.25 秒，每条飞 1.25 秒。时间线以百分比写在 SVG 自己的 <style> 里，因此一个 animation-duration 就能等比缩放整段飞行。",
  "anatomy.clock": "t = {t} s",
  "anatomy.state.waiting": "等待",
  "anatomy.state.flying": "飞行中",
  "anatomy.state.landed": "已落位",
  "anatomy.step.meta": "自{side}进入 · {pct}% 落位",
  "anatomy.weave.title": "编织格",
  "anatomy.weave.body":
    "蓝色在一个 100 单位格里压过橙色竖条，位置是 (200, 400)。绘制顺序让橙色后画，因此文件把蓝色再画一遍并裁剪到 #weave-slot，以保住编织。",
  "anatomy.fact.paint": "绘制顺序 = 到达顺序的倒序",
  "anatomy.fact.ease": "每段飞行都用 cubic-bezier(0.22, 1, 0.36, 1)",
  "anatomy.fact.delay": "没有 animation-delay——整段编排只随一个时长缩放",
  "anatomy.hint": "滚动即擦除时间线",
  "side.top": "顶部",
  "side.right": "右侧",
  "side.bottom": "底部",
  "side.left": "左侧",
  "bar.orange": "橙色",
  "bar.green": "绿色",
  "bar.yellow": "黄色",
  "bar.blue": "蓝色",
  "variants.title": "变体",
  "variants.lede":
    "静态与动画各 6 个文件。_B 铺一层不透明白底，_BR 再给它加 rx=\"100\" 圆角——一个设计单位，与色条厚度、留白同值。其余文件透明。",
  "variants.group.icon": "图标",
  "variants.group.full": "完整标志",
  "variants.kind.static": "静态",
  "variants.kind.animated": "动画",
  "variants.layer.none": "透明",
  "variants.layer.white": "白底层",
  "variants.layer.rounded": "白底层，rx 100",
  "variants.alt": "SharpDotNUT 标志：{file}",
  "palette.title": "配色",
  "palette.lede": "标志由四条色条构成。悬停或聚焦色卡可单独查看，点击复制色值。字标固定为 #000000。",
  "palette.copy": "复制 {hex}",
  "palette.copied": "已复制",
  "component.title": "网页组件",
  "component.lede":
    "<logo-anim> 把动画 SVG 载入 shadow root，并暴露 speed、paused 与 replay()。<img> 里的动画 SVG 是独立文档，页面 CSS 够不着。",
  "component.speed": "速度",
  "component.pause": "暂停",
  "component.resume": "继续",
  "component.replay": "重播",
  "component.note": "时长由 getComputedStyle 从 SVG 读回（图标 2 秒、完整标志 4 秒），speed 是它的倍率。",
  "usage.title": "安装与使用",
  "usage.lede":
    "包内共 18 个文件（打包约 10 kB）：12 个 SVG、组件、类型声明与 PNG 光栅化模块。没有运行时依赖，也没有 CLI；sharp 可选，只在需要 PNG 时用到。",
  "usage.install": "安装",
  "usage.assets": "按名字解析 SVG",
  "usage.pngs": "生成 PNG",
  "usage.copy": "复制",
  "usage.copied": "已复制",
  "usage.license.title": "许可",
  "usage.license.body":
    "标志可按原样使用、展示、引用与分享（含商业用途），无需署名。不得修改、变色、变形、拆分或组合，不得暗示背书，不得用于误导或违法内容，不得注册为商标、域名或账号。图稿与组件代码均由 LICENSE 覆盖（仅英文）。",
  "footer.repo": "GitHub",
  "footer.license": "LICENSE",
  "footer.npm": "npm",
};

const messages: Record<Locale, Record<MessageKey, string>> = { en, zh };

function read(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") return stored;
  } catch {
    // private mode: fall back to the browser language
  }
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export const locale = ref<Locale>(read());

function applyLang(): void {
  document.documentElement.lang = locale.value === "zh" ? "zh-CN" : "en";
}

export function setLocale(next: Locale): void {
  locale.value = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // private mode: session-only choice
  }
  applyLang();
}

export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  let text = messages[locale.value][key];
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function useI18n() {
  return { locale, setLocale, t };
}

applyLang();
