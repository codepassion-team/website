export {};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function track(event: string, params: Record<string, string> = {}) {
  window.gtag?.("event", event, params);
}

// Navbar scroll treatment
const nav = document.getElementById("loa-navbar");
const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 50);
window.addEventListener("scroll", () => requestAnimationFrame(onScroll), {
  passive: true,
});
onScroll();

// Theme toggle
const updateThemeIcons = () => {
  const isDark = document.documentElement.dataset.theme !== "light";
  document
    .getElementById("loa-icon-light")
    ?.classList.toggle("hidden", !isDark);
  document.getElementById("loa-icon-dark")?.classList.toggle("hidden", isDark);
};
document.getElementById("loa-theme-toggle")?.addEventListener("click", () => {
  const next =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Storage blocked (private mode); theme still applies for this visit
  }
  updateThemeIcons();
});
updateThemeIcons();

// Scroll reveals
const reveal = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      reveal.unobserve(entry.target);
    }
  },
  { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
);
document
  .querySelectorAll(".animate-on-scroll")
  .forEach((el) => reveal.observe(el));

// LINE add-friend clicks: GA event tagged by position, Meta Lead
document
  .querySelectorAll<HTMLAnchorElement>('a[href*="line.me"]')
  .forEach((link) =>
    link.addEventListener("click", () => {
      track("line_add_friend_click", {
        position: link.dataset.lineCta ?? "other",
      });
      window.fbq?.("track", "Lead");
    }),
  );

const mobileCta = document.getElementById("loa-mobile-cta");

// Mobile menu
const menu = document.getElementById("loa-mobile-menu");
const menuToggle = document.getElementById("loa-menu-toggle");
let menuOpen = false;

function setMenu(open: boolean) {
  if (!menu || !menuToggle) return;
  menuOpen = open;
  menu.hidden = !open;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "ปิดเมนู" : "เปิดเมนู");
  document.getElementById("loa-menu-open")?.classList.toggle("hidden", open);
  document.getElementById("loa-menu-close")?.classList.toggle("hidden", !open);
  nav?.classList.toggle("menu-open", open);
  syncMobileCta();
}

menuToggle?.addEventListener("click", () => setMenu(!menuOpen));
menu?.addEventListener("click", (event) => {
  if ((event.target as HTMLElement).closest("a")) setMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !menuOpen) return;
  setMenu(false);
  menuToggle?.focus();
});
window.matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

// Mobile sticky CTA: only once the hero CTA has scrolled away, and never
// over the LINE contact section, the closing CTA band, or an open menu
const visibleBlockers = new Set<Element>();

function syncMobileCta() {
  if (!mobileCta) return;
  const hide = visibleBlockers.size > 0 || menuOpen;
  mobileCta.classList.toggle("is-hidden", hide);
  mobileCta.setAttribute("aria-hidden", String(hide));
  mobileCta.tabIndex = hide ? -1 : 0;
}

if (mobileCta) {
  const blockers = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visibleBlockers.add(entry.target);
      else visibleBlockers.delete(entry.target);
    }
    syncMobileCta();
  });
  for (const selector of [
    '[data-line-cta="hero"]',
    "#contact",
    '[data-line-cta="footer"]',
  ]) {
    const el = document.querySelector(selector);
    if (el) blockers.observe(el);
  }
  syncMobileCta();
}
