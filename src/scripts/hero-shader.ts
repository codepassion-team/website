// Animated WebGPU background for the hero. The static glow stays underneath,
// so unsupported browsers and reduced motion still get a finished look.
type Layer = {
  type: string;
  id?: string;
  props?: Record<string, unknown>;
  children?: Layer[];
};

// A planet rising behind the hero: purple ambient light, a dark body that
// holds the copy and stack, and an animated rim in the logo's rose, ember and
// a gold highlight. Sizes are in canvas heights: a Circle radius of 1 is half
// a height, and the LightEdge sphere's radius is 0.35 x scale heights.
const RIM_TOP = 0.08;
const RIM_DROP = 0.37;
const MAX_RADIUS = 1.05; // LightEdge accepts a scale of at most 3

// Keeps the rim's top just under the header and lets the arc meet the sides
// about RIM_DROP lower. The centre never rises above the bottom edge, so
// narrow screens get a flatter horizon instead of a whole sphere.
function planetGeometry(width: number, height: number) {
  const half = width / height / 2;
  const fitted = (half * half + RIM_DROP * RIM_DROP) / (2 * RIM_DROP);
  const radius = Math.min(MAX_RADIUS, Math.max(fitted, 1 - RIM_TOP));
  return { center: { x: 0.5, y: RIM_TOP + radius }, radius };
}

function bodyProps({ center, radius }: ReturnType<typeof planetGeometry>) {
  return { center, radius: radius * 2 };
}

function rimProps({ center, radius }: ReturnType<typeof planetGeometry>) {
  return { center, scale: radius / 0.35 };
}

function layers(width: number, height: number): Layer[] {
  const planet = planetGeometry(width, height);
  return [
    {
      type: "FlowingGradient",
      props: {
        colorA: "#120a2e",
        colorB: "#3a1a8c",
        colorC: "#6b2fa0",
        colorD: "#24126a",
        speed: 0.5,
        distortion: 0.5,
      },
    },
    {
      type: "Circle",
      id: "body",
      props: { ...bodyProps(planet), color: "#05040b", softness: 0.08 },
    },
    // Indigo light pooling low inside the planet.
    {
      type: "Circle",
      props: {
        center: { x: 0.42, y: 1.3 },
        radius: 1.8,
        color: "#3a22a088",
        softness: 1.4,
      },
    },
    {
      type: "LightEdge",
      id: "rim",
      props: {
        ...rimProps(planet),
        stops: [
          { color: "#ed1b5d", position: 0 },
          { color: "#f04d2d", position: 0.35 },
          { color: "#ffc58a", position: 0.6 },
          { color: "#ed1b5d", position: 1 },
        ],
        thickness: 0.012,
        softness: 0.25,
        intensity: 0.8,
        bloom: 0.3,
        spots: 2,
        spotSize: 0.6,
        smoke: 0.15,
        speed: 0.5,
      },
    },
    { type: "FilmGrain", props: { strength: 0.03 } },
  ];
}

export async function setupHeroShader() {
  const canvas = document.getElementById("hero-shader");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("gpu" in navigator)) return;
  const stage = canvas.parentElement;
  if (!stage) return;

  const { createShader } = await import("shaders/js");
  const shader = await createShader(
    canvas,
    { components: layers(stage.clientWidth, stage.clientHeight) },
    { onError: () => canvas.remove() },
  ).catch(() => null);
  if (!shader) {
    canvas.remove();
    return;
  }
  canvas.classList.add("is-ready");

  // The library pins the canvas to its first size, so follow the stage and
  // refit the planet to the new proportions.
  new ResizeObserver(() => {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const planet = planetGeometry(width, height);
    shader.resize(width, height);
    shader.update("body", bodyProps(planet));
    shader.update("rim", rimProps(planet));
  }).observe(stage);
}
