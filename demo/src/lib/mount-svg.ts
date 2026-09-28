/**
 * Mounts an SVG document string into `target`, the way `logo-anim.js` does: parsing as XML keeps
 * the SVG namespace, the inner `<style>` and `url(#…)` references intact.
 */
export function mountSvg(markup: string, target: Element): SVGSVGElement | null {
  const svg = new DOMParser().parseFromString(markup, "image/svg+xml").documentElement;
  if (svg.nodeName !== "svg") {
    console.error("demo: markup is not an SVG document");
    return null;
  }
  // generateLogo() emits no viewBox; adding one is what makes CSS scaling reliable.
  if (!svg.getAttribute("viewBox")) {
    svg.setAttribute("viewBox", `0 0 ${svg.getAttribute("width")} ${svg.getAttribute("height")}`);
  }
  svg.setAttribute("aria-hidden", "true");
  target.replaceChildren(document.adoptNode(svg));
  return svg as unknown as SVGSVGElement;
}
