# SharpDotNUT Logo

本文档中英并列：每个小节先英文、后中文。 / Bilingual README: every section is English first,
then Chinese.

<img src="./dist/Logo.svg" alt="SharpDotNUT" width="70" height="70" />
<img src="./dist/Logo_B.svg" alt="SharpDotNUT" width="70" height="70" />
<img src="./dist/Logo_BR.svg" alt="SharpDotNUT" width="70" height="70" />
<br />
<img src="./dist/Logo_Full.svg" alt="SharpDotNUT" width="210" height="70" />
<img src="./dist/Logo_Full_B.svg" alt="SharpDotNUT" width="210" height="70" />
<img src="./dist/Logo_Full_BR.svg" alt="SharpDotNUT" width="210" height="70" />

## Animated logo / 动画标志

<img src="./dist/Logo_Animated.svg" alt="Animated SharpDotNUT" width="210" height="210" />
<img src="./dist/Logo_Animated_B.svg" alt="Animated SharpDotNUT on white" width="210" height="210" />
<img src="./dist/Logo_Animated_BR.svg" alt="Animated SharpDotNUT on rounded white" width="210" height="210" />
<br />
<img src="./dist/Logo_Animated_Full.svg" alt="Animated SharpDotNUT full logo" width="630" height="210" />
<img src="./dist/Logo_Animated_Full_B.svg" alt="Animated SharpDotNUT full logo on white" width="630" height="210" />
<img src="./dist/Logo_Animated_Full_BR.svg" alt="Animated SharpDotNUT full logo on rounded white" width="630" height="210" />

The `_B` files paint an opaque white layer behind the artwork and `_BR` adds a `rx="100"` corner
to it — one design unit, the same as the bar thickness and the padding; the others are transparent.

`_B` 文件在画面背后铺一层不透明白底，`_BR` 再给它加一个 `rx="100"` 圆角——一个设计单位，与色条厚度、
留白同值；其余文件透明。

## Web Component / 网页组件

`logo-anim.js` loads an animated SVG into a shadow root and is the only way to control the
animation from the page — an animated SVG in an `<img>` is a separate document that page CSS
cannot reach.

`logo-anim.js` 把动画 SVG 载入 shadow root，是页面里唯一能控制这条动画的方式——`<img>` 里的动画 SVG
是独立文档，页面 CSS 够不着。

```html
<script type="module" src="./logo-anim.js"></script>

<logo-anim src="./dist/Logo_Animated.svg" alt="SharpDotNUT" style="width: 70px"></logo-anim>
<logo-anim src="./dist/Logo_Animated_B.svg" alt="SharpDotNUT on white" style="width: 70px"></logo-anim>
<logo-anim id="logo" src="./dist/Logo_Animated_Full.svg" alt="SharpDotNUT" style="width: 210px"></logo-anim>

<script type="module">
  const logo = document.querySelector("#logo");
  logo.speed = 2; // twice as fast, applied live / 两倍速，立即生效
  logo.paused = true; // freeze on the current frame / 冻结在当前帧
  logo.replay(); // back to the first frame / 回到第一帧
</script>
```

| Attribute | Behaviour / 行为 |
| --------- | ---------------- |
| `src`     | animated SVG to load — `_B` / `_BR` for the white layer, square or rounded — resolved with `fetch` (same origin or CORS) <br /> 要加载的动画 SVG——白底用 `_B` / `_BR`，方角或圆角——通过 `fetch` 加载（同源或 CORS） |
| `speed`   | positive multiplier on the SVG's own duration, default `1`; invalid values fall back to `1` <br /> SVG 自身时长的正数倍率，默认 `1`；非法值回退为 `1` |
| `paused`  | freeze on the current frame <br /> 冻结在当前帧 |
| `alt`     | accessible name; without it the element is hidden from assistive tech <br /> 无障碍名称；不设时元素对辅助技术隐藏 |

Methods: `play()`, `pause()`, `replay()`. Properties `speed` and `paused` mirror the attributes.

方法：`play()`、`pause()`、`replay()`。属性 `speed`、`paused` 与同名 attribute 镜像。

The variant is chosen with `src`: the `_B` and `_BR` files already carry the white layer, so
`<logo-anim src="./dist/Logo_Animated_BR.svg">` needs nothing else.

变体由 `src` 决定：`_B`、`_BR` 文件自带白底，所以 `<logo-anim src="./dist/Logo_Animated_BR.svg">`
不需要别的东西。

The shadow root holds `svg { width: 100% }`, so size the element itself with CSS; unset, it takes
the SVG's intrinsic width (700px or 2100px). The duration is read from the SVG with
`getComputedStyle` (`2s` icon, `4s` full logo) and `speed` scales the whole timeline, because every
keyframe is a percentage. `prefers-reduced-motion: reduce` holds the finished logo instead of
playing.

shadow root 里是 `svg { width: 100% }`，所以用 CSS 给元素本体定尺寸；不设时取 SVG 的固有宽度
（700px 或 2100px）。时长由 `getComputedStyle` 从 SVG 里读回（图标 `2s`、完整标志 `4s`），`speed`
缩放整条时间线——因为每个关键帧都是百分比。`prefers-reduced-motion: reduce` 时停在完成态而不播放。

## Regenerating the assets / 重新生成产物

```bash
pnpm install      # sharp, the only dependency / 唯一依赖
node generate.ts  # rewrites all of dist/ / 重写整个 dist/
```

`logo.ts` holds the artwork and the SVG builders; `generate.ts` writes the 12 artifacts — 6 static
as SVG + PNG, 6 animated as SVG. `dist/*.svg` is the deliverable, `dist/*.png` is a build leftover.

`logo.ts` 存放图稿与 SVG 构建函数，`generate.ts` 写出 12 个产物——6 个静态的 SVG + PNG，6 个动画 SVG。
`dist/*.svg` 是交付物，`dist/*.png` 是构建副产品。
