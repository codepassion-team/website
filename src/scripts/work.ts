import { translate } from "../data/landing-ui";
import { setupNavigation, setupPortfolio } from "./site";

const t = (text: string) =>
  translate(document.documentElement.lang === "th" ? "th" : "en", text);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function setupFilter(signal: AbortSignal) {
  const buttons = [
    ...document.querySelectorAll<HTMLButtonElement>(".work-filter button"),
  ];
  const grid = document.querySelector<HTMLElement>(".work-grid");
  const cards = [...document.querySelectorAll<HTMLElement>(".work-card")];
  const count = document.getElementById("work-count");
  let fade = 0;

  function apply(group: string) {
    let shown = 0;
    for (const card of cards) {
      card.hidden = group !== "all" && card.dataset.group !== group;
      if (!card.hidden) shown++;
    }
    if (count) count.textContent = `${t("Showing")} ${shown} ${t("projects")}`;
  }
  function choose(button: HTMLButtonElement) {
    buttons.forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    const group = button.dataset.group ?? "all";
    clearTimeout(fade);
    if (reducedMotion.matches || !grid) return apply(group);
    grid.classList.add("is-filtering");
    fade = window.setTimeout(() => {
      apply(group);
      grid.classList.remove("is-filtering");
    }, 160);
  }
  buttons.forEach((button) =>
    button.addEventListener("click", () => choose(button), { signal }),
  );
  apply("all");
  return () => clearTimeout(fade);
}

function setupDetail(signal: AbortSignal) {
  const dialog = document.querySelector<HTMLDialogElement>("#work-detail");
  const preview = dialog?.querySelector<HTMLElement>(".project-preview");
  const shot = dialog?.querySelector<HTMLElement>(".work-detail-shot");
  const image = document.querySelector<HTMLImageElement>("#work-detail-image");
  const cover = dialog?.querySelector<HTMLImageElement>(".work-cover-shot");
  const cards = [...document.querySelectorAll<HTMLElement>(".work-card")];
  const portfolio = setupPortfolio(signal, ".work-card[data-project-url]");
  if (!dialog || !preview || !shot || !image) return () => portfolio.dispose();
  const field = (name: string) =>
    dialog.querySelector<HTMLElement>(`[data-detail="${name}"]`)!;
  let opener: HTMLElement | null = null;

  const copyImage = (target: HTMLImageElement, source: HTMLImageElement) => {
    target.srcset = source.srcset;
    target.src = source.src;
  };

  function open(card: HTMLElement) {
    const imageOnly = card.dataset.imageOnly === "true";
    const cardImage = card.querySelector<HTMLImageElement>(".work-shot img")!;
    const kind = card.querySelector(".work-kind")?.textContent?.trim();
    const label = card
      .querySelector('[data-card="label"]')!
      .textContent!.trim();
    field("label").textContent = kind ? `${label} · ${kind}` : label;
    field("name").textContent = card.dataset.projectName ?? "";
    field("description").textContent =
      card.querySelector(".work-desc")?.textContent ?? "";
    field("tags").replaceChildren(
      ...[...card.querySelectorAll(".work-tags > span")].map((tag) =>
        tag.cloneNode(true),
      ),
    );
    preview!.hidden = imageOnly;
    shot!.hidden = !imageOnly;
    if (imageOnly) {
      copyImage(image!, cardImage);
      image!.alt = `${card.dataset.projectName} — ${t("Website preview")}`;
    } else if (cover) copyImage(cover, cardImage);
    opener = card;
    history.replaceState(null, "", `#${card.dataset.slug}`);
    dialog!.showModal();
    // Select once the preview is on screen: a quick close-and-reopen gives the
    // visibility observer no change to report, so select() starts the load.
    if (!imageOnly) portfolio.select(card);
  }

  cards.forEach((card) =>
    card.addEventListener("click", () => open(card), { signal }),
  );
  dialog
    .querySelector(".work-detail-close")
    ?.addEventListener("click", () => dialog.close(), { signal });
  dialog.addEventListener(
    "click",
    (event) => {
      if (event.target === dialog) dialog.close();
    },
    { signal },
  );
  dialog.addEventListener(
    "close",
    () => {
      // "close" fires as a task; ignore it if another project already reopened.
      if (dialog.open) return;
      // Unload the site so video and audio stop with the dialog.
      portfolio.reset();
      history.replaceState(null, "", location.pathname + location.search);
      opener?.focus();
    },
    { signal },
  );

  const linked = cards.find(
    (card) => `#${card.dataset.slug}` === decodeURIComponent(location.hash),
  );
  if (linked) open(linked);

  return () => {
    if (dialog.open) dialog.close();
    portfolio.dispose();
  };
}

let cleanup = () => {};
function initialize() {
  cleanup();
  const controller = new AbortController();
  const disposeNavigation = setupNavigation(controller.signal);
  const disposeFilter = setupFilter(controller.signal);
  const disposeDetail = setupDetail(controller.signal);
  cleanup = () => {
    disposeNavigation();
    disposeDetail();
    disposeFilter();
    controller.abort();
  };
}
initialize();
window.addEventListener("pagehide", () => cleanup());
window.addEventListener("pageshow", (event) => {
  if (event.persisted) initialize();
});
