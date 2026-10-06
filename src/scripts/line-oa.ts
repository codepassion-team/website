import {
  submitDemoRequest,
  validateDemoRequest,
  type ContactChannel,
  type DemoField,
} from "~/lib/demo-request";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const ENDPOINT = import.meta.env.PUBLIC_DEMO_REQUEST_ENDPOINT ?? "";
const LINE_URL = "https://line.me/ti/p/@codepassion";
const FAILURE_MESSAGE = {
  unconfigured: "ขณะนี้ยังส่งคำขอผ่านแบบฟอร์มไม่ได้",
  error: "ส่งคำขอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
};

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

// Primary CTA clicks, tagged by position
document
  .querySelectorAll<HTMLAnchorElement>("[data-demo-cta]")
  .forEach((cta) =>
    cta.addEventListener("click", () =>
      track("demo_cta_click", { position: cta.dataset.demoCta ?? "" }),
    ),
  );

// Demo form
const form = document.getElementById("demo-form") as HTMLFormElement | null;
const success = document.getElementById("demo-success");
const status = document.getElementById("demo-status");
const contact = document.getElementById(
  "demo-contact",
) as HTMLInputElement | null;
const contactLabel = document.getElementById("demo-contact-label");
const mobileCta = document.getElementById("loa-mobile-cta");

const CONTACT_INPUT: Record<
  ContactChannel,
  {
    label: string;
    type: string;
    inputMode: string;
    autocomplete: string;
    placeholder: string;
  }
> = {
  phone: {
    label: "เบอร์โทร",
    type: "tel",
    inputMode: "tel",
    autocomplete: "tel",
    placeholder: "เช่น 081 234 5678",
  },
  email: {
    label: "อีเมล",
    type: "email",
    inputMode: "email",
    autocomplete: "email",
    placeholder: "name@company.com",
  },
  line: {
    label: "LINE ID",
    type: "text",
    inputMode: "text",
    autocomplete: "off",
    placeholder: "LINE ID ของคุณ",
  },
};

if (form && contact && success && status) {
  let started = false;
  form.addEventListener("input", () => {
    if (started) return;
    started = true;
    track("demo_form_start");
  });

  form
    .querySelectorAll<HTMLInputElement>('input[name="channel"]')
    .forEach((radio) =>
      radio.addEventListener("change", () => {
        const config = CONTACT_INPUT[radio.value as ContactChannel];
        contact.type = config.type;
        contact.inputMode = config.inputMode;
        contact.autocomplete = config.autocomplete as AutoFill;
        contact.placeholder = config.placeholder;
        if (contactLabel) contactLabel.textContent = config.label;
        contact.focus();
      }),
    );

  const showErrors = (errors: Partial<Record<DemoField, string>>) => {
    form.querySelectorAll<HTMLElement>("[data-error-for]").forEach((el) => {
      const field = el.dataset.errorFor as DemoField;
      el.textContent = errors[field] ?? "";
      form
        .querySelectorAll<HTMLElement>(`[name="${field}"]`)
        .forEach((input) =>
          input.setAttribute("aria-invalid", errors[field] ? "true" : "false"),
        );
    });
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.replaceChildren();
    const data = new FormData(form);
    const result = validateDemoRequest({
      name: String(data.get("name") ?? ""),
      company: String(data.get("company") ?? ""),
      channel: String(data.get("channel") ?? ""),
      contact: String(data.get("contact") ?? ""),
      topic: String(data.get("topic") ?? ""),
    });
    showErrors(result.ok ? {} : result.errors);
    if (!result.ok) {
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    const button = form.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );
    if (button) button.disabled = true;
    const outcome = await submitDemoRequest(ENDPOINT, result.value);
    if (button) button.disabled = false;

    if (outcome !== "success") {
      const line = document.createElement("a");
      line.href = LINE_URL;
      line.target = "_blank";
      line.rel = "noopener noreferrer";
      line.className = "underline underline-offset-2";
      line.textContent = "LINE @codepassion";
      status.replaceChildren(
        `${FAILURE_MESSAGE[outcome]} หรือทักเราทาง `,
        line,
      );
      return;
    }

    track("demo_request_success", { topic: result.value.topic || "none" });
    window.fbq?.("track", "Lead");
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });
}

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
// over the form, the closing CTA band, an open menu, or a focused field
const visibleBlockers = new Set<Element>();
let typing = false;

function syncMobileCta() {
  if (!mobileCta) return;
  const hide = visibleBlockers.size > 0 || typing || menuOpen;
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
    '[data-demo-cta="hero"]',
    "#demo",
    '[data-demo-cta="footer"]',
  ]) {
    const el = document.querySelector(selector);
    if (el) blockers.observe(el);
  }
  document.addEventListener("focusin", (event) => {
    typing = (event.target as HTMLElement).matches("input, select, textarea");
    syncMobileCta();
  });
  document.addEventListener("focusout", () => {
    typing = false;
    syncMobileCta();
  });
  syncMobileCta();
}
