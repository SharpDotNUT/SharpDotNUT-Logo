# SharpDotNUT Logo

<img src="./dist/Logo.svg" alt="SharpDotNUT" width="70" height="70" />
<img src="./dist/Logo_B.svg" alt="SharpDotNUT" width="70" height="70" />
<img src="./dist/Logo_BR.svg" alt="SharpDotNUT" width="70" height="70" />
<br />
<img src="./dist/Logo_Full.svg" alt="SharpDotNUT" width="210" height="70" />
<img src="./dist/Logo_Full_B.svg" alt="SharpDotNUT" width="210" height="70" />
<img src="./dist/Logo_Full_BR.svg" alt="SharpDotNUT" width="210" height="70" />

## Animated logo

<img src="./dist/Logo_Animated.svg" alt="Animated SharpDotNUT" width="210" height="210" />
<img src="./dist/Logo_Animated_B.svg" alt="Animated SharpDotNUT on white" width="210" height="210" />
<img src="./dist/Logo_Animated_BR.svg" alt="Animated SharpDotNUT on rounded white" width="210" height="210" />
<br />
<img src="./dist/Logo_Animated_Full.svg" alt="Animated SharpDotNUT full logo" width="630" height="210" />
<img src="./dist/Logo_Animated_Full_B.svg" alt="Animated SharpDotNUT full logo on white" width="630" height="210" />
<img src="./dist/Logo_Animated_Full_BR.svg" alt="Animated SharpDotNUT full logo on rounded white" width="630" height="210" />

The `_B` files paint an opaque white layer behind the artwork and `_BR` adds a `rx="100"` corner
to it — one design unit, the same as the bar thickness and the padding; the others are transparent.

## Web Component

`logo-anim.js` loads an animated SVG into a shadow root and is the only way to control the
animation from the page — an animated SVG in an `<img>` is a separate document that page CSS
cannot reach.

```html
<script type="module" src="./logo-anim.js"></script>

<logo-anim src="./dist/Logo_Animated.svg" alt="SharpDotNUT" style="width: 70px"></logo-anim>
<logo-anim src="./dist/Logo_Animated_B.svg" alt="SharpDotNUT on white" style="width: 70px"></logo-anim>
<logo-anim id="logo" src="./dist/Logo_Animated_Full.svg" alt="SharpDotNUT" style="width: 210px"></logo-anim>

<script type="module">
  const logo = document.querySelector("#logo");
  logo.speed = 2; // twice as fast, applied live
  logo.paused = true; // freeze on the current frame
  logo.replay(); // back to the first frame
</script>
```

| Attribute |                                                                                             |
| --------- | ------------------------------------------------------------------------------------------- |
| `src`     | animated SVG to load — `_B` / `_BR` for the white layer, square or rounded — resolved with `fetch` (same origin or CORS) |
| `speed`   | positive multiplier on the SVG's own duration, default `1`; invalid values fall back to `1`   |
| `paused`  | freeze on the current frame                                                                  |
| `alt`     | accessible name; without it the element is hidden from assistive tech                         |

Methods: `play()`, `pause()`, `replay()`. Properties `speed` and `paused` mirror the attributes.

The variant is chosen with `src`: the `_B` and `_BR` files already carry the white layer, so
`<logo-anim src="./dist/Logo_Animated_BR.svg">` needs nothing else.

The shadow root holds `svg { width: 100% }`, so size the element itself with CSS; unset, it takes
the SVG's intrinsic width (700px or 2100px). The duration is read from the SVG with
`getComputedStyle` (`2s` icon, `4s` full logo) and `speed` scales the whole timeline, because every
keyframe is a percentage. `prefers-reduced-motion: reduce` holds the finished logo instead of
playing.