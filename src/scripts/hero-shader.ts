// Animated WebGPU background for the hero. The static glow stays underneath,
// so unsupported browsers and reduced motion still get a finished look.
type Layer = {
  type: string;
  props?: Record<string, unknown>;
  children?: Layer[];
};

const grain: Layer = { type: "FilmGrain", props: { strength: 0.03 } };

// Near-black base with crimson and deep-navy light that visibly drifts.
const base: Layer = {
  type: "FlowingGradient",
  props: {
    colorA: "#040405",
    colorB: "#0a0a0e",
    colorC: "#9a2a2e",
    colorD: "#1a2747",
    speed: 0.7,
    distortion: 0.75,
  },
};

const components: Layer[] = [base, grain];

export async function setupHeroShader() {
  const canvas = document.getElementById("hero-shader");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("gpu" in navigator)) return;

  const { createShader } = await import("shaders/js");
  await createShader(
    canvas,
    { components },
    { onError: () => canvas.remove() },
  ).then(
    () => canvas.classList.add("is-ready"),
    () => canvas.remove(),
  );
}
