import { translate } from "../data/landing-ui";
const t = (text: string) =>
  translate(document.documentElement.lang === "th" ? "th" : "en", text);

export function setupNavigation(signal: AbortSignal) {
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
  // The header is transparent over the hero and docks, with its background,
  // once the first section reaches the upper half of the screen. A midpoint
  // still counts anchor jumps, which stop short of the top (scroll-padding).
  const header = document.getElementById("site-header");
  const firstSection = document.getElementById("expertise");
  const updateDock = () => {
    if (!header) return;
    // Pages without the home hero keep the solid header.
    if (!firstSection) return header.classList.add("is-docked");
    header.classList.toggle(
      "is-docked",
      firstSection.getBoundingClientRect().top <= window.innerHeight / 2,
    );
  };
  window.addEventListener("scroll", updateDock, { passive: true, signal });
  window.addEventListener("resize", updateDock, { passive: true, signal });
  updateDock();
  return () => {
    returnFocus = null;
    closeMenu();
    document.documentElement.classList.remove("menu-open");
    toggle?.setAttribute("aria-expanded", "false");
  };
}

export function setupPortfolio(
  signal: AbortSignal,
  cardSelector = ".project-button",
) {
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
    "#preview-external, #preview-open",
  );
  const buttons = [...document.querySelectorAll<HTMLElement>(cardSelector)];
  if (!frame || !cover || !name || !domain || !status || !preview)
    return { dispose() {}, reset() {}, select(_card: HTMLElement) {} };
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
  function select(button: HTMLElement) {
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
        ? t("Try embedded preview")
        : t("Load live preview");
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
      link.setAttribute(
        "aria-label",
        `${t("Open website")} ${button.dataset.projectName}`,
      );
    });
    buttons.forEach((item) => {
      if (!item.hasAttribute("aria-pressed")) return;
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
  function reset() {
    resetFrame();
    attempted = true;
    if (load) {
      load.hidden = false;
      load.textContent = t("Load live preview");
    }
    if (note) note.textContent = t("Loads the selected website here.");
    status!.textContent = t(
      "Preview closed. Choose a project to keep exploring.",
    );
  }
  close?.addEventListener(
    "click",
    () => {
      reset();
      load?.focus();
    },
    { signal },
  );
  return {
    dispose() {
      cancelLoading();
      observer.disconnect();
    },
    reset,
    select,
  };
}
