import { translate } from "../data/landing-ui";
const t = (text: string) =>
  translate(document.documentElement.lang === "th" ? "th" : "en", text);

import { createArchitectureRenderer } from "./architecture";
import { setupHeroShader } from "./hero-shader";
import { setupNavigation, setupPortfolio } from "./site";
import {
  layerStoryPosition,
  chapterOpacity,
  followScroll,
  chapterScrollPosition,
} from "./story-timeline";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function setupLogoMarquee(signal: AbortSignal) {
  const marquee = document.querySelector<HTMLElement>(".logo-marquee");
  const toggle = document.querySelector<HTMLButtonElement>(
    "#logo-motion-toggle",
  );
  if (!marquee || !toggle) return () => {};
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = false;
  let dragging = false;
  let lastX = 0;
  let resumeTimer = 0;
  function update() {
    toggle.hidden = preference.matches;
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.textContent = paused ? t("Play logos") : t("Pause logos");
    marquee.classList.toggle("is-paused", paused);
  }
  function noteInteraction() {
    if (paused) return;
    marquee.classList.add("is-paused");
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      marquee.classList.remove("is-paused");
    }, 900);
  }
  toggle.addEventListener(
    "click",
    () => {
      paused = !paused;
      update();
    },
    { signal },
  );
  marquee.addEventListener(
    "pointerdown",
    (event) => {
      noteInteraction();
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      lastX = event.clientX;
      marquee.setPointerCapture(event.pointerId);
      marquee.classList.add("is-dragging");
    },
    { signal },
  );
  marquee.addEventListener(
    "pointermove",
    (event) => {
      if (!dragging) return;
      noteInteraction();
      marquee.scrollLeft += lastX - event.clientX;
      lastX = event.clientX;
    },
    { signal },
  );
  const stopDrag = () => {
    dragging = false;
    marquee.classList.remove("is-dragging");
    noteInteraction();
  };
  marquee.addEventListener("pointerup", stopDrag, { signal });
  marquee.addEventListener("pointercancel", stopDrag, { signal });
  marquee.addEventListener("lostpointercapture", stopDrag, { signal });
  marquee.addEventListener("wheel", noteInteraction, {
    passive: true,
    signal,
  });
  marquee.addEventListener("keydown", noteInteraction, { signal });
  preference.addEventListener("change", update, { signal });
  update();
  return () => {
    window.clearTimeout(resumeTimer);
  };
}

function setupStory(signal: AbortSignal) {
  const story = document.querySelector<HTMLElement>(".story");
  const canvas = document.querySelector<HTMLCanvasElement>(
    "#architecture-canvas",
  );
  const chapters = Array.from(
    document.querySelectorAll<HTMLElement>(".story-chapter"),
  );
  const siteHeader = document.querySelector<HTMLElement>("#site-header");
  const navigation = document.querySelector<HTMLElement>(".story-navigation");
  const dots = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".story-dot"),
  );
  const label = document.getElementById("sculpture-label");
  const motionToggles = document.querySelectorAll<HTMLButtonElement>(
    "#motion-toggle, .menu-motion-toggle",
  );
  const mobileViewport = matchMedia("(max-width: 800px)");
  if (!story || !canvas) return () => {};
  const storyBrand = story.querySelector<HTMLElement>(".story-brand");
  function updateStoryBrand() {
    if (!storyBrand || !siteHeader) return;
    const headerBounds = siteHeader.getBoundingClientRect();
    const headerVisible =
      headerBounds.bottom > 0 && headerBounds.top < window.innerHeight;
    storyBrand.classList.toggle("is-visible", !headerVisible);
  }
  const renderer = createArchitectureRenderer(canvas);
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const shortViewport = matchMedia(
    "(max-height: 450px), (min-width: 801px) and (max-height: 650px)",
  );
  let canvasAvailable = !!renderer;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  const constrained = connection?.saveData === true;
  let manualMotion: boolean | null = null;
  let animated = !preference.matches && !constrained && !!renderer;
  let request = 0;
  let cachedProgress = -1;
  let displayedScroll: number | null = null;
  let lastFrameTime = 0;
  let navigationChapter: number | null = null;

  function render(now: number) {
    request = 0;
    const stage = story!.querySelector<HTMLElement>(".story-stage");
    if (!stage) return;
    const distance = story!.offsetHeight - stage.offsetHeight;
    const scrollProgress = animated
      ? clamp(-story!.getBoundingClientRect().top / Math.max(1, distance))
      : 0;
    const elapsed = lastFrameTime ? Math.min(64, now - lastFrameTime) : 16;
    lastFrameTime = now;
    const bounds = story!.getBoundingClientRect();
    const outsideStage = bounds.bottom < 0 || bounds.top > stage.offsetHeight;
    displayedScroll =
      displayedScroll === null || !animated || outsideStage
        ? scrollProgress
        : followScroll(displayedScroll, scrollProgress, elapsed);
    const progress = layerStoryPosition(
      displayedScroll,
      mobileViewport.matches,
    );
    if (displayedScroll !== scrollProgress) schedule();

    if (progress === cachedProgress) return;
    cachedProgress = progress;

    const opacity = chapters.map((_, index) => chapterOpacity(progress, index));
    story!.dataset.beat =
      chapters[Math.round(progress)]?.dataset.layerKey ?? "stack";
    chapters.forEach((chapter, index) => {
      const visible = opacity[index] > 0.02;
      chapter.classList.toggle("is-current", visible);
      chapter.style.opacity = String(opacity[index]);
      chapter.inert = !visible;
      chapter.setAttribute("aria-hidden", String(!visible));
    });
    const activeIndex = Math.round(progress);
    const activeChapter = chapters[activeIndex];
    const side = activeChapter?.dataset.copySide === "right" ? "right" : "left";
    const kicker =
      activeIndex > 0
        ? activeChapter.querySelector<HTMLElement>(".layer-kicker")
        : null;
    const canvasBounds = canvas!.getBoundingClientRect();
    const kickerBounds = kicker?.getBoundingClientRect();
    const chapterBounds = activeChapter.getBoundingClientRect();
    const openingBounds = chapters[0].getBoundingClientRect();
    renderer?.draw(
      progress,
      kickerBounds
        ? {
            x: mobileViewport.matches
              ? side === "left"
                ? 16
                : canvasBounds.width - 16
              : (side === "left"
                  ? kickerBounds.right + 8
                  : kickerBounds.left - 8) - canvasBounds.left,
            y:
              (mobileViewport.matches
                ? kickerBounds.top - 14
                : kickerBounds.top + kickerBounds.height / 2) -
              canvasBounds.top,
            clearanceX:
              (side === "left"
                ? chapterBounds.right + 10
                : chapterBounds.left - 10) - canvasBounds.left,
            side,
            opacity: opacity[activeIndex],
          }
        : undefined,
      openingBounds.bottom - canvasBounds.top,
    );
    dots.forEach((dot, index) => {
      if (index === activeIndex) dot.setAttribute("aria-current", "step");
      else dot.removeAttribute("aria-current");
    });
    if (
      navigationChapter !== null &&
      Math.abs(progress - navigationChapter) < 0.01
    )
      navigationChapter = null;
    if (label)
      label.textContent =
        chapters[Math.round(progress)]?.dataset.layerLabel ?? "FULL STACK";
  }
  function schedule() {
    if (!request) request = requestAnimationFrame(render);
  }
  function configure() {
    animated =
      !preference.matches &&
      !constrained &&
      !shortViewport.matches &&
      (manualMotion ?? true) &&
      canvasAvailable;
    if (navigation) navigation.hidden = !animated;
    navigationChapter = null;
    story!.classList.toggle("is-enhanced", animated);
    story!.classList.toggle("static-story", !animated);
    story!.classList.toggle("canvas-ready", canvasAvailable);
    story!.dataset.composition = mobileViewport.matches
      ? "portrait"
      : "landscape";
    motionToggles.forEach((toggle) => {
      toggle.hidden =
        !canvasAvailable ||
        preference.matches ||
        constrained ||
        shortViewport.matches;
      if (toggle.id === "motion-toggle")
        toggle.setAttribute(
          "aria-label",
          animated ? t("Pause motion") : t("Play motion"),
        );
      else {
        toggle.textContent = animated ? t("Motion on") : t("Motion off");
        toggle.setAttribute("aria-pressed", String(animated));
      }
    });
    cachedProgress = -1;
    displayedScroll = null;
    lastFrameTime = 0;
    renderer?.resize();
    schedule();
  }
  function navigateToChapter(index: number) {
    if (!animated) return;
    navigationChapter = Math.max(0, Math.min(chapters.length - 1, index));
    const stage = story!.querySelector<HTMLElement>(".story-stage")!;
    const distance = story!.offsetHeight - stage.offsetHeight;
    const top = window.scrollY + story!.getBoundingClientRect().top;
    window.scrollTo({
      top:
        top +
        chapterScrollPosition(navigationChapter, mobileViewport.matches) *
          distance,
      behavior: "smooth",
    });
  }
  dots.forEach((dot, index) =>
    dot.addEventListener("click", () => navigateToChapter(index), { signal }),
  );
  const cancelNavigation = () => {
    navigationChapter = null;
  };
  window.addEventListener("wheel", cancelNavigation, { passive: true, signal });
  window.addEventListener("touchstart", cancelNavigation, {
    passive: true,
    signal,
  });
  window.addEventListener("scroll", schedule, { passive: true, signal });
  window.addEventListener("scroll", updateStoryBrand, {
    passive: true,
    signal,
  });
  updateStoryBrand();
  preference.addEventListener("change", configure, { signal });
  shortViewport.addEventListener("change", configure, { signal });
  motionToggles.forEach((motionToggle) =>
    motionToggle.addEventListener(
      "click",
      () => {
        manualMotion = !animated;
        configure();
        if (motionToggle.id === "motion-toggle")
          story!.scrollIntoView({ block: "start" });
      },
      { signal },
    ),
  );
  mobileViewport.addEventListener("change", configure, { signal });
  canvas.addEventListener(
    "contextlost",
    () => {
      canvasAvailable = false;
      configure();
    },
    { signal },
  );
  canvas.addEventListener(
    "contextrestored",
    () => {
      canvasAvailable = true;
      configure();
    },
    { signal },
  );
  const observer = new ResizeObserver(() => {
    cachedProgress = -1;
    displayedScroll = null;
    lastFrameTime = 0;
    renderer?.resize();
    schedule();
  });
  observer.observe(canvas);
  configure();
  return () => {
    observer.disconnect();
    cancelAnimationFrame(request);
    renderer?.dispose();
  };
}

let cleanup = () => {};
function initialize() {
  cleanup();
  const controller = new AbortController();
  const disposeNavigation = setupNavigation(controller.signal);
  const portfolio = setupPortfolio(controller.signal);
  const disposeLogos = setupLogoMarquee(controller.signal);
  const disposeStory = setupStory(controller.signal);
  cleanup = () => {
    disposeNavigation();
    controller.abort();
    disposeStory();
    portfolio.dispose();
    disposeLogos();
  };
}
initialize();
window.addEventListener("pagehide", () => cleanup());
window.addEventListener("pageshow", (event) => {
  if (event.persisted) initialize();
});

void setupHeroShader();
