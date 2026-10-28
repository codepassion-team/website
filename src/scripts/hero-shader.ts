// Animated WebGPU background for the hero. The static glow stays underneath,
// so unsupported browsers and reduced motion still get a finished look.
type Layer = {
  type: string;
  props?: Record<string, unknown>;
  children?: Layer[];
};

const grain: Layer = { type: "FilmGrain", props: { strength: 0.03 } };

// Near-black base with soft graphite light that slowly drifts.
const base: Layer = {
  type: "FlowingGradient",
  props: {
    colorA: "#08090a",
    colorB: "#0b0c0e",
    colorC: "#24262b",
    colorD: "#111317",
    speed: 0.4,
    distortion: 0.55,
  },
};

const components: Layer[] = [base, grain];

export async function setupHeroShader() {
  const canvas = document.getElementById("hero-shader");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("gpu" in navigator)) return;

  const { createShader } = await import("shaders/js");
  const shader = await createShader(
    canvas,
    { components },
    { onError: () => canvas.remove() },
  ).catch(() => null);
  if (!shader) {
    canvas.remove();
    return;
  }
  canvas.classList.add("is-ready");

  // The library pins the canvas to its first size, so follow the stage instead.
  const stage = canvas.parentElement;
  if (stage)
    new ResizeObserver(() =>
      shader.resize(stage.clientWidth, stage.clientHeight),
    ).observe(stage);
}
