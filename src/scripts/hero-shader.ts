// Animated WebGPU background for the hero. The static grid and halo stay
// underneath, so unsupported browsers and reduced motion see the old look.
export async function setupHeroShader() {
  const canvas = document.getElementById("hero-shader");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("gpu" in navigator)) return;

  const { createShader } = await import("shaders/js");
  await createShader(
    canvas,
    {
      components: [
        {
          type: "FlowingGradient",
          props: {
            colorA: "#0a0a0d",
            colorB: "#2a0d12",
            colorC: "#6b1f25",
            colorD: "#4a1a1f",
            speed: 0.3,
            distortion: 0.4,
          },
        },
      ],
    },
    { onError: () => canvas.remove() },
  ).then(
    () => canvas.classList.add("is-ready"),
    () => canvas.remove(),
  );
}
