import { translate } from "../data/landing-ui";
const t = (text: string) =>
  translate(document.documentElement.lang === "th" ? "th" : "en", text);

import { createArchitectureRenderer } from "./architecture";
import {
  layerStoryPosition,
  chapterOpacity,
  followScroll,
  chapterScrollPosition,
} from "./story-timeline";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function setupNavigation(signal: AbortSignal) {
  const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
  const dialog = document.querySelector<HTMLDialogElement>("#mobile-menu");
  const close = dialog?.querySelector<HTMLButtonElement>(".menu-close");
  const products = document.querySelector<HTMLDetailsElement>(".product-menu");
  const mobileViewport = matchMedia("(max-width: 800px)");
  let returnFocus: HTMLElement | null = toggle;
  const closeMenu = () => dialog?.close();
  const resetMenu = () => {
    document.documentElement.classList.remove("menu-open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", t("Open navigation"));
    returnFocus?.focus({ preventScroll: true });
  };
  toggle?.addEventListener(
    "click",
    () => {
      if (!dialog) return;
      if (dialog.open) {
        closeMenu();
        return;
      }
      returnFocus = toggle;
      dialog.showModal();
      document.documentElement.classList.add("menu-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", t("Close navigation"));
      close?.focus();
    },
    { signal },
  );
  close?.addEventListener("click", closeMenu, { signal });
  dialog?.addEventListener("close", resetMenu, { signal });
  dialog?.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Tab") return;
      const controls = [
        ...dialog.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ),
      ].filter(
        (element) => !element.hidden && element.getClientRects().length > 0,
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    },
    { signal },
  );
  // Native dialog confines keyboard focus and handles Escape. Internal links
  // transfer focus to their destination after the modal closes.
  dialog?.addEventListener(
    "click",
    (event) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>("a");
      if (link?.hash) {
        const destination = document.getElementById(link.hash.slice(1));
        destination?.setAttribute("tabindex", "-1");
        returnFocus = destination;
      }
      if (link || event.target === dialog) closeMenu();
    },
    { signal },
  );
  mobileViewport.addEventListener(
    "change",
    () => {
      if (!mobileViewport.matches && dialog?.open) {
        returnFocus = null;
        closeMenu();
      }
    },
    { signal },
  );
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && products?.open) {
        products.open = false;
        products.querySelector("summary")?.focus();
      }
    },
    { signal },
  );
  document.addEventListener(
    "click",
    (event) => {
      if (products && !products.contains(event.target as Node))
        products.open = false;
    },
    { signal },
  );
  products?.querySelectorAll("a").forEach((link) =>
    link.addEventListener(
      "click",
      () => {
        products.open = false;
      },
      { signal },
    ),
  );
  return () => {
    returnFocus = null;
    closeMenu();
    document.documentElement.classList.remove("menu-open");
    toggle?.setAttribute("aria-expanded", "false");
  };
}

function setupPortfolio(signal: AbortSignal) {
  let frame = document.querySelector<HTMLIFrameElement>("#portfolio-frame");
  const cover = document.getElementById("preview-cover");
  const name = document.getElementById("preview-name");
  const domain = document.getElementById("preview-domain");
  const status = document.getElementById("preview-status");
  const note = document.getElementById("preview-note");
  const brand = document.getElementById("preview-brand");
  const spinner = document.getElementById("preview-spinner");
  const load = document.querySelector<HTMLButtonElement>("#load-preview");
  const show = document.querySelector<HTMLButtonElement>("#show-preview");
  const close = document.querySelector<HTMLButtonElement>("#close-preview");
  const direct = document.querySelector<HTMLAnchorElement>("#preview-open");
  const preview = document.querySelector<HTMLElement>(".project-preview");
  const links = document.querySelectorAll<HTMLAnchorElement>(
    "#preview-external, #preview-external-top, #preview-open",
  );
  const buttons = [
    ...document.querySelectorAll<HTMLButtonElement>(".project-button"),
  ];
  if (!frame || !cover || !name || !domain || !status || !preview)
    return () => {};
  let selected =
    buttons.find((button) => button.getAttribute("aria-pressed") === "true") ??
    buttons[0];
  let visible = false;
  let attempted = frame.hasAttribute("src");
  let pending: AbortController | null = null;
  let timeout = 0;
  let revealTimer = 0;
  let focusOnReveal = false;
  let loading = false;

  function cancelLoading() {
    pending?.abort();
    pending = null;
    clearTimeout(timeout);
    clearTimeout(revealTimer);
    loading = false;
    preview!.removeAttribute("aria-busy");
    if (spinner) spinner.hidden = true;
    if (show) show.hidden = true;
  }
  function resetFrame() {
    cancelLoading();
    // A fresh node prevents late events from a previous site revealing this one.
    const next = frame!.cloneNode(false) as HTMLIFrameElement;
    next.removeAttribute("src");
    next.hidden = true;
    next.style.opacity = "0";
    next.tabIndex = -1;
    frame!.replaceWith(next);
    frame = next;
    cover!.hidden = false;
    if (close) close.hidden = true;
  }
  function reveal() {
    if (!loading) return;
    cancelLoading();
    frame!.style.opacity = "1";
    frame!.tabIndex = 0;
    cover!.hidden = true;
    status!.textContent = t(
      "Preview requested. If it is unavailable, use Visit website to open the original.",
    );
    if (focusOnReveal) frame!.focus();
  }
  function loadPreview(focus: boolean) {
    const url = selected?.dataset.projectUrl;
    if (!url) return;
    resetFrame();
    attempted = true;
    loading = true;
    focusOnReveal = focus;
    preview!.setAttribute("aria-busy", "true");
    if (load) load.hidden = true;
    if (direct) direct.hidden = false;
    if (close) close.hidden = false;
    if (spinner) spinner.hidden = false;
    if (note) note.textContent = t("Loading website…");
    status!.textContent = t("You can also open the website in a new tab.");
    pending = new AbortController();
    const loadingFrame = frame!;
    loadingFrame.addEventListener(
      "load",
      () => {
        if (loadingFrame !== frame || !loading) return;
        // Cross-origin content cannot be inspected. Allow a short paint interval
        // after document load, without claiming that every remote widget is ready.
        revealTimer = window.setTimeout(reveal, 900);
      },
      { signal: pending.signal, once: true },
    );
    timeout = window.setTimeout(() => {
      if (!loading) return;
      preview!.removeAttribute("aria-busy");
      if (spinner) spinner.hidden = true;
      if (show) show.hidden = false;
      if (load) {
        load.hidden = false;
        load.textContent = t("Reload preview");
      }
      if (note) note.textContent = t("The website is taking longer to load.");
    }, 12000);
    loadingFrame.hidden = false;
    loadingFrame.src = url;
  }
  function select(button: HTMLButtonElement) {
    selected = button;
    resetFrame();
    const unavailable = button.dataset.previewUnavailable === "true";
    attempted = unavailable;
    if (direct) direct.hidden = !unavailable;
    if (load) {
      load.hidden = false;
      load.classList.toggle("button-light", !unavailable);
      load.classList.toggle("button-quiet", unavailable);
      load.textContent = unavailable
        ? t("Try embedded preview ↗")
        : t("Load live preview ↗");
    }
    if (note)
      note.textContent = unavailable
        ? t("Best explored on its own website.")
        : t("Loads the selected website here.");
    if (brand)
      brand.hidden = button.dataset.projectDomain !== "kantanaholdings.com";
    name!.textContent = button.dataset.projectName ?? "";
    domain!.textContent = button.dataset.projectDomain ?? "";
    frame!.title = `${button.dataset.projectName} — ${t("Our work")}`;
    links.forEach((link) => {
      link.href = button.dataset.projectUrl!;
      link.setAttribute("aria-label", `${button.dataset.projectName} ↗`);
    });
    buttons.forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
      item.classList.toggle("is-selected", item === button);
    });
    status!.textContent = t(
      "The preview opens as you scroll here. Some sites may restrict embedding.",
    );
    if (visible && !unavailable) loadPreview(false);
  }
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries.some(
        (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.15,
      );
      if (visible && !attempted) loadPreview(false);
    },
    { threshold: 0.15 },
  );
  observer.observe(preview);
  buttons.forEach((button) =>
    button.addEventListener("click", () => select(button), { signal }),
  );
  load?.addEventListener("click", () => loadPreview(true), { signal });
  show?.addEventListener(
    "click",
    () => {
      focusOnReveal = true;
      reveal();
    },
    { signal },
  );
  close?.addEventListener(
    "click",
    () => {
      resetFrame();
      attempted = true;
      if (load) {
        load.hidden = false;
        load.textContent = t("Load live preview ↗");
      }
      if (note) note.textContent = t("Loads the selected website here.");
      status!.textContent = t(
        "Preview closed. Choose a project to keep exploring.",
      );
      load?.focus();
    },
    { signal },
  );
  return () => {
    cancelLoading();
    observer.disconnect();
  };
}

function setupLogoMarquee(signal: AbortSignal) {
  const marquee = document.querySelector<HTMLElement>(".logo-marquee");
  const toggle = document.querySelector<HTMLButtonElement>(
    "#logo-motion-toggle",
  );
  if (!marquee || !toggle) return () => {};
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = false;
  let visible = false;
  let hovering = false;
  let dragging = false;
  let lastX = 0;
  let previousTime = 0;
  let animation = 0;
  function update() {
    toggle.hidden = preference.matches;
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.textContent = paused ? t("Play logos") : t("Pause logos");
  }
  function pause() {
    paused = true;
    update();
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
    "pointerenter",
    (event) => {
      hovering = event.pointerType === "mouse";
    },
    { signal },
  );
  marquee.addEventListener(
    "pointerleave",
    () => {
      hovering = false;
    },
    { signal },
  );
  marquee.addEventListener(
    "pointerdown",
    (event) => {
      pause();
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
      marquee.scrollLeft += lastX - event.clientX;
      lastX = event.clientX;
    },
    { signal },
  );
  const stopDrag = () => {
    dragging = false;
    marquee.classList.remove("is-dragging");
  };
  marquee.addEventListener("pointerup", stopDrag, { signal });
  marquee.addEventListener("pointercancel", stopDrag, { signal });
  marquee.addEventListener("lostpointercapture", stopDrag, { signal });
  marquee.addEventListener("wheel", pause, { passive: true, signal });
  marquee.addEventListener("keydown", pause, { signal });
  preference.addEventListener("change", update, { signal });
  const observer = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
  });
  observer.observe(marquee);
  function tick(time: number) {
    const elapsed = Math.min(time - previousTime, 50);
    previousTime = time;
    if (
      visible &&
      !paused &&
      !hovering &&
      !preference.matches &&
      !document.hidden &&
      document.activeElement !== marquee
    ) {
      const loopWidth =
        marquee.querySelector<HTMLElement>(".logo-set")?.offsetWidth ?? 0;
      marquee.scrollLeft += elapsed * 0.035;
      if (loopWidth && marquee.scrollLeft >= loopWidth)
        marquee.scrollLeft -= loopWidth;
    }
    animation = requestAnimationFrame(tick);
  }
  animation = requestAnimationFrame(tick);
  update();
  return () => {
    observer.disconnect();
    cancelAnimationFrame(animation);
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
  const navigation = document.querySelector<HTMLElement>(".story-navigation");
  const previous = document.querySelector<HTMLButtonElement>("#story-previous");
  const next = document.querySelector<HTMLButtonElement>("#story-next");
  const currentNumber = document.getElementById("story-current");
  const label = document.getElementById("sculpture-label");
  const motionToggles = document.querySelectorAll<HTMLButtonElement>(
    "#motion-toggle, .menu-motion-toggle",
  );
  const mobileViewport = matchMedia("(max-width: 800px)");
  if (!story || !canvas) return () => {};
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
    );
    if (currentNumber)
      currentNumber.textContent = String(activeIndex + 1).padStart(2, "0");
    if (previous) previous.disabled = activeIndex === 0;
    if (next) next.disabled = activeIndex === chapters.length - 1;
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
      toggle.textContent = animated ? t("Motion on") : t("Motion off");
      toggle.setAttribute("aria-pressed", String(animated));
    });
    cachedProgress = -1;
    displayedScroll = null;
    lastFrameTime = 0;
    renderer?.resize();
    schedule();
  }
  function navigateChapter(direction: number) {
    if (!animated) return;
    const current =
      navigationChapter ?? Math.round(Math.max(0, cachedProgress));
    navigationChapter = Math.max(
      0,
      Math.min(chapters.length - 1, current + direction),
    );
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
  previous?.addEventListener("click", () => navigateChapter(-1), { signal });
  next?.addEventListener("click", () => navigateChapter(1), { signal });
  const cancelNavigation = () => {
    navigationChapter = null;
  };
  window.addEventListener("wheel", cancelNavigation, { passive: true, signal });
  window.addEventListener("touchstart", cancelNavigation, {
    passive: true,
    signal,
  });
  window.addEventListener("scroll", schedule, { passive: true, signal });
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
  const disposePortfolio = setupPortfolio(controller.signal);
  const disposeLogos = setupLogoMarquee(controller.signal);
  const disposeStory = setupStory(controller.signal);
  cleanup = () => {
    disposeNavigation();
    controller.abort();
    disposeStory();
    disposePortfolio();
    disposeLogos();
  };
}
initialize();
window.addEventListener("pagehide", () => cleanup());
window.addEventListener("pageshow", (event) => {
  if (event.persisted) initialize();
});
