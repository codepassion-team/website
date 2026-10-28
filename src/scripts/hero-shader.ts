// Animated WebGPU background for the hero. The static glow stays underneath,
// so unsupported browsers and reduced motion still get a finished look.
type Layer = {
  type: string;
  props?: Record<string, unknown>;
  children?: Layer[];
};

const grain: Layer = { type: "FilmGrain", props: { strength: 0.06 } };

// Near-black base with a faint crimson glow.
const base: Layer = {
  type: "FlowingGradient",
  props: {
    colorA: "#050506",
    colorB: "#08080b",
    colorC: "#2a0c10",
    colorD: "#0b0d14",
    speed: 0.15,
    distortion: 0.25,
  },
};

// A fine, slowly twinkling dot matrix over the glow.
const components: Layer[] = [
  base,
  {
    type: "DotGrid",
    props: { color: "#ffffff17", density: 70, dotSize: 0.08, twinkle: 0.3 },
  },
  grain,
];

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
