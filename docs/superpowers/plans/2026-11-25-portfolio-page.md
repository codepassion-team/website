# Portfolio Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/work/` and `/en/work/`, a filterable page of 13 CodePassion projects with screenshot cards and a detail dialog, plus a "View all work" link from the home page.

**Architecture:** Static Astro page built from the landing components (`Header.astro`, a footer extracted from `LandingPage.astro`) and one shared `projects` list in `src/data/landing.ts`. The detail dialog embeds the same live-preview block as the home page and drives it with the existing preview loader, which moves out of `src/scripts/landing.ts` into a shared module. Filtering and the dialog are a small vanilla script.

**Tech Stack:** Astro 4.6, `astro:assets` `<Image>`, vanilla TS, existing landing CSS. Checks are `node:assert` scripts run against `dist/` (repo pattern: `scripts/check-*.mjs`, Node 24 runs `.ts` imports directly).

**Spec:** `docs/superpowers/specs/2026-11-25-portfolio-page-design.md`

## Global Constraints

- No new dependencies. No React on this page. No iframes in the grid.
- Reuse landing CSS tokens and classes (`section`, `section-top`, `eyebrow`, `micro`, `section-heading`, `button`, `button-light`, `button-quiet`). Red accent only on the active filter underline and card hover border.
- Never invent client facts. Descriptions state only what the site visibly is. Tech tags only when confirmed from the project's repo.
- The home page HTML must stay the same except for the new "View all work" link and the footer "Our work" link. `node scripts/check-landing.mjs` stays green throughout.
- Honour `prefers-reduced-motion`: no transforms or transitions on cards or filter when it is set.
- Every commit: `npx --yes pnpm@8.7.1 run build && for f in scripts/check-*.mjs; do node $f || exit 1; done`. Conventional Commits (`c9n-commit-messages`).
- Run `npx --yes pnpm@8.7.1 install --frozen-lockfile` once first (no `node_modules` yet).

## Review Focus

1. **Closing the dialog while a site is playing** (Kantana autoplays video): the iframe must be unloaded on close. Test in Task 4.
2. **Opening project B right after A:** A's late `load` event must not reveal over B. The existing `resetFrame` clones the iframe; keep it. Test in Task 4 (manual step).
3. **Deep link to an unknown or internal slug** (`/work/#nope`, `/work/#nnm`): unknown does nothing, internal opens the image-only dialog. Test in Task 4.
4. **Filter that leaves a big card alone, then back to All:** no grid holes, original order restored. `grid-auto-flow: dense` plus DOM order. Test in Task 4 (manual at 1440, 900, 390).
5. **360px phone width:** the filter row scrolls on its own and the page doesn't scroll sideways. Test in Task 5 via `shoot.mjs --overflow 360,390`.

---

## File map

| File | Responsibility |
|---|---|
| `src/data/landing.ts` | `projects` grows to 13 with new fields; `projectGroups` |
| `src/data/landing-locales.ts` | Thai `category`, `description`, `tags` per slug |
| `src/data/landing-ui.ts` | Thai strings for the new page |
| `src/assets/work/<slug>.webp` | 13 screenshots |
| `src/components/landing/ProjectPreview.astro` | the browser-chrome + iframe block, moved from `Portfolio.astro` |
| `src/components/landing/SiteFooter.astro` | footer moved from `LandingPage.astro` |
| `src/components/landing/Header.astro` | `home`, `alternates`, `showMotionToggle` props |
| `src/components/landing/WorkPage.astro` | the new page |
| `src/pages/work.astro`, `src/pages/en/work.astro` | `<WorkPage locale=…/>` |
| `src/scripts/site.ts` | `setupNavigation`, `setupPortfolio` moved from `landing.ts` |
| `src/scripts/work.ts` | filter, dialog, hash |
| `src/styles/work.css` | page-specific styles |
| `scripts/check-work.mjs` | data + build-output checks |

---

### Task 1: Shared project data

**Files:**
- Modify: `src/data/landing.ts:185-225`, `src/data/landing-locales.ts:135-146`, `src/components/landing/Portfolio.astro`, `scripts/check-landing.mjs`
- Create: `scripts/check-work.mjs`

**Interfaces:**
- Produces:
  ```ts
  type ProjectGroup = "corporate" | "ecommerce" | "healthcare" | "events" | "platforms";
  type Project = {
    slug: string; name: string; domain: string; number: string;
    category: string; group: ProjectGroup;
    kind: "client" | "product" | "internal";
    size: "lg" | "md" | "sm"; featured: boolean;
    description: string; tags: string[];
  };
  export const projects: Project[];          // 13, display order
  export const projectGroups: { id: ProjectGroup; label: string }[]; // EN labels
  ```
  `getLandingContent("th").projects` carries Thai `category`, `description`, `tags`; `projectGroups` Thai labels.

- [ ] **Step 1: Write the failing data checks** in `scripts/check-work.mjs` (top of file, before any `dist` reads):

```js
import assert from "node:assert/strict";
import { projects, projectGroups } from "../src/data/landing.ts";
import { getLandingContent } from "../src/data/landing-locales.ts";

assert.equal(projects.length, 13);
assert.equal(new Set(projects.map((p) => p.slug)).size, 13);
assert.deepEqual(
  projects.filter((p) => p.featured).map((p) => p.domain),
  ["kantanaholdings.com", "ddgjewelry.com", "trphospital.com",
   "naturalhome.co.th", "smartsmeexpo.com", "www.franchiseexpothailand.com"],
);
assert(!projects.some((p) => p.domain.includes("aestec")));
assert.equal(projects.find((p) => p.slug === "nnm").kind, "internal");
assert.deepEqual(
  projects.filter((p) => p.kind === "product").map((p) => p.slug),
  ["memberconnex", "academy"],
);
const groups = new Set(projectGroups.map((g) => g.id));
for (const locale of ["th", "en"])
  for (const p of getLandingContent(locale).projects) {
    assert(groups.has(p.group), `${p.slug} group`);
    assert(p.description && p.tags.length >= 1, `${locale} ${p.slug} copy`);
    assert(locale === "en" || !/^[A-Za-z ]+$/.test(p.description), `${p.slug} Thai description`);
  }
```

- [ ] **Step 2:** `node scripts/check-work.mjs` → FAIL (`projects.length` is 6).

- [ ] **Step 3: Fill the data.** Rows, groups, `kind`, Thai/EN labels and URLs come verbatim from the spec's Projects table (13 rows, Aestec excluded). Slugs: `kantana, ddg, trp, naturalhome, smartsme, franchise-expo, movie-school, mindscix, kcp, lawnextstep, nnm, memberconnex, academy`. The first 6 keep their current `number` and are `featured: true`. Sizes: `lg` for kantana, movie-school, memberconnex; `md` for ddg, trp, mindscix, nnm, lawnextstep; `sm` for the rest (tune in Task 5). Descriptions: one factual line per spec rule, from each site's own title or meta. Tags: 1–2 service tags. Tech tags only after confirming with `gh api repos/codepassion-team/<repo>/languages` or the repo's `package.json` (known: movie-school = Astro, Cloudflare Workers, Google Apps Script; MemberConnex = LINE OA, LIFF). Thai overrides in `landing-locales.ts` are keyed by `slug`, not by index. `unavailablePreviews` stays.

- [ ] **Step 4: Point the home list at featured projects.** In `Portfolio.astro`, use `projects.filter((p) => p.featured)`. In `check-landing.mjs:60`, loop over `projects.filter((p) => p.featured)`.

- [ ] **Step 5:** Build, then run all checks → PASS. Home HTML is unchanged (`git stash` not needed: `check-landing` covers it).

- [ ] **Step 6: Commit** `feat(work): share 13-project portfolio data`

---

### Task 2: Screenshots

**Files:**
- Create: `src/assets/work/<slug>.webp` ×13; capture script in the scratchpad (not committed)
- Modify: `scripts/check-work.mjs`

- [ ] **Step 1: Add the failing check**

```js
import { access } from "node:fs/promises";
for (const p of projects) await access(`src/assets/work/${p.slug}.webp`);
```

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3: Capture.** Import `findChrome` from `~/.claude/skills/c9n-landing-page/scripts/chrome.mjs`. For each project, run headless Chrome with `--window-size=1440,900 --hide-scrollbars --virtual-time-budget=8000 --screenshot=<tmp>.png https://<domain>` (NNM: `https://nnm.codepassion.co/`, which lands on the login page). Convert with `sharp(png).resize(1440).webp({ quality: 78 })`. If a site shows a cookie or popup banner in the shot, retake it with a longer budget or crop. Never edit content.

- [ ] **Step 4: Show the user all 13 images** (paths or a contact sheet) and wait for OK. Retake any they reject.

- [ ] **Step 5:** Run checks → PASS. Commit `feat(work): add project screenshots`.

---

### Task 3: Header, footer and preview block reusable off the home page

**Files:**
- Modify: `src/components/landing/Header.astro`, `src/components/landing/LandingPage.astro:532-580`, `src/components/landing/Portfolio.astro`, `src/scripts/landing.ts`
- Create: `src/components/landing/SiteFooter.astro`, `src/components/landing/ProjectPreview.astro`, `src/scripts/site.ts`

**Interfaces:**
- Produces:
  - `Header.astro` props: `{ locale: Locale; home?: string; alternates?: { th: string; en: string }; showMotionToggle?: boolean }`. `home` is prefixed to every `#hash` link and the brand link (default `""`, so the home output doesn't change; `/work/` passes `"/"` or `"/en/"`). `alternates` drives the TH/EN links (default `{ th: "/", en: "/en/" }`). `showMotionToggle` defaults to `true`.
  - `SiteFooter.astro` props: `{ locale: Locale; home?: string }`, the same `home` rule. The "Our work" link becomes `${locale === "en" ? "/en/" : "/"}work/` on every page.
  - `ProjectPreview.astro` props: `{ locale: Locale; project: Project }`. This is the `.project-preview` markup from `Portfolio.astro` with the same ids. It renders an optional `<slot name="cover" />` inside `#preview-cover`.
  - `src/scripts/site.ts`:
    ```ts
    export function setupNavigation(signal: AbortSignal): () => void;
    export function setupPortfolio(
      signal: AbortSignal,
      cardSelector?: string,           // default ".project-button"
    ): { dispose(): void; reset(): void; select(card: HTMLElement): void };
    ```
    `select` toggles `aria-pressed` and `is-selected` only on cards that have `aria-pressed`. `reset()` = `resetFrame()` and puts the load button back (the existing close-button behaviour, minus the focus move). `setupNavigation`: if `#expertise` is missing, the header gets `is-docked` permanently.

- [ ] **Step 1: Extend `check-landing.mjs` with a failing assertion** that the footer links to the page: `assert(html.includes(\`href="${locale === "en" ? "/en/" : "/"}work/"\`))`. Run → FAIL.
- [ ] **Step 2:** Do the moves and add the props. `landing.ts` imports from `./site` and uses `.dispose()`. Change the footer "Our work" href.
- [ ] **Step 3:** Build and run all checks → PASS. `check-landing` passing is the proof that the home output stays the same.
- [ ] **Step 4: Commit** `refactor(landing): share header, footer and preview off the home page`

---

### Task 4: The `/work/` page

**Files:**
- Create: `src/components/landing/WorkPage.astro`, `src/pages/work.astro`, `src/pages/en/work.astro`, `src/scripts/work.ts`, `src/styles/work.css`
- Modify: `src/data/landing-ui.ts`, `src/components/landing/Portfolio.astro`, `scripts/check-work.mjs`

**Interfaces:**
- Consumes: Task 1 data, Task 2 images, Task 3 props and `setupPortfolio(signal, ".work-card[data-project-url]")`.
- DOM contract that `work.ts` relies on:
  - `.work-filter button[data-group]` (`"all"` or a group id) with `aria-pressed`.
  - `.work-card` is a `<button>` with `data-slug`, `data-group`, `data-kind`, `data-project-name`, and for non-internal cards `data-project-url`, `data-project-domain`, `data-preview-unavailable`.
  - `<dialog id="work-detail">` holds `[data-detail="label|name|description|tags"]`, `#work-detail-image` (an `<img>` filled from the card's screenshot `currentSrc`), one `<ProjectPreview>`, and `#work-detail-visit`.
  - `#work-count` is a polite live region.

- [ ] **Step 1: Write the failing build-output checks** (append to `check-work.mjs`):

```js
import { readFile } from "node:fs/promises";
for (const [locale, path, root] of [["th","dist/work/index.html","/"],["en","dist/en/work/index.html","/en/"]]) {
  const html = await readFile(path, "utf8");
  const content = getLandingContent(locale);
  assert(html.includes(`lang="${locale}"`));
  assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1);
  assert(html.includes(`rel="canonical" href="https://codepassion.co${root}work/"`));
  assert(html.includes('hreflang="th" href="https://codepassion.co/work/"'));
  assert(html.includes('hreflang="en" href="https://codepassion.co/en/work/"'));
  assert.equal([...html.matchAll(/class="work-card[" ]/g)].length, 13);
  assert.equal([...html.matchAll(/data-group="/g)].length, 13 + 1 + projectGroups.length);
  assert(!html.includes("<iframe") || [...html.matchAll(/<iframe/g)].length === 1, "only the dialog iframe");
  assert(!/<iframe[^>]*\ssrc=/.test(html), "iframe loads lazily");
  const nnm = html.match(/<button[^>]*data-slug="nnm"[^>]*>/)[0];
  assert(!nnm.includes("data-project-url"), "internal has no live link");
  assert(!html.includes('href="https://nnm.codepassion.co'), "no NNM link anywhere");
  for (const p of content.projects) assert(html.includes(p.description));
  assert(html.includes(`href="${root}#contact"`), "header CTA goes home");
  assert(html.includes(`href="${root}work/"`) || html.includes(`href="/en/work/"`));
  assert(html.includes('"@type":"ItemList"'));
  assert(!html.includes('id="motion-toggle"') && !html.includes("menu-motion-toggle"));
  assert(html.includes("<noscript"));
}
const sitemap = await readFile("dist/sitemap.xml", "utf8");
assert(sitemap.includes("/work/</loc>") && sitemap.includes("/en/work/</loc>"));
for (const [path, href] of [["dist/index.html","/work/"],["dist/en/index.html","/en/work/"]]) {
  const portfolio = (await readFile(path, "utf8")).match(/id="work"[\s\S]*?<\/section>/)[0];
  assert(portfolio.includes(`href="${href}"`), "home has a View all work link");
}
```

- [ ] **Step 2:** Build, run → FAIL (no `dist/work`).

- [ ] **Step 3: Page markup and styles** in `WorkPage.astro`. Copy the `<head>` pattern from `LandingPage.astro` with its own title, description, canonical, hreflang (th, en, x-default → `/work/`) and OG `/cover.jpg`. Add `ItemList` JSON-LD of `{ "@type": "CreativeWork", name, url }` for client and product projects only. Sections and copy follow the spec's "Page structure" 2–6. Exact EN copy: eyebrow `OUR WORK`, h1 `Our Work`, secondary `Digital Experiences Built with Purpose.`, CTA heading `Have a project in mind?`, CTA text `Let's build something meaningful together.`, button `Contact Us` → `company.contactUrl` (`button button-light`), plus `company.phone`. Thai copy goes through `landing-ui.ts` (h1 `ผลงานของเรา`, CTA `มีโปรเจกต์ในใจไหม?` / `ติดต่อเรา`). Cards use `<Image>` from `src/assets/work/<slug>.webp`, `widths={[480, 960, 1440]}`, and the `sizes` that match the grid. Use `loading="eager"` for the first two cards. Cards show `kind` labels "ผลิตภัณฑ์ของ CodePassion / A CodePassion product" and "ระบบภายใน · ต้องล็อกอิน / Internal system · login required". `<noscript>`: hide the filter; under the grid, list direct links for every card that isn't internal. Styles live in `work.css` with a 12-col grid, `grid-auto-flow: dense`, and `lg` 8 / `md` 6 / `sm` 4. At ≤1024px use 2 columns (`lg` spans 2). At ≤640px use 1 column.

- [ ] **Step 4: `work.ts`.**
  - The filter sets `hidden` on cards outside the group and updates `aria-pressed` and `#work-count` ("แสดง N ผลงาน" / "Showing N projects"). Fade by toggling a class before `hidden`. Skip the fade under reduced motion.
  - Card click fills the dialog fields and calls `showModal()`. Non-internal cards also call `portfolio.select(card)`, show the preview and the visit link, and hide the image. Internal cards hide the preview and the visit link and show the image.
  - The dialog `close` event calls `portfolio.reset()`, clears the hash with `history.replaceState`, and returns focus to the card. A backdrop click closes the dialog.
  - Live preview behaviour is the home loader's, unchanged: once the dialog is visible it starts loading the site, with the cover (the screenshot goes in the `cover` slot) shown until the site paints. This replaces the spec's "screenshot first, click to load", so there's one loader instead of two (user-visible deviation, flagged at handoff).
  - On load, `location.hash` matching a card's `data-slug` opens it. Anything else is ignored.
  - Init the same way as `landing.ts`, with AbortController, `pagehide` and `pageshow`, calling `setupNavigation`.

- [ ] **Step 5: Home link.** In `Portfolio.astro`, add `<a class="button button-quiet portfolio-all" href={...}>{t("View all work →")}</a>` under `.project-list`. Thai: `ดูผลงานทั้งหมด →`.

- [ ] **Step 6:** Build and run all checks → PASS.

- [ ] **Step 7: Manual check of Review Focus 1–4** in `npx astro preview` at 1440/900/390:
  - Open Kantana, close it: the iframe has no `src` after close.
  - Open A and then B quickly: B never shows A's site.
  - `/work/#nope` does nothing. `/work/#nnm` opens the image-only dialog.
  - Filter Events and then All: no holes, original order.

- [ ] **Step 8: Commit** `feat(work): add portfolio page with filter and project detail`

---

### Task 5: Design pass and verification

**Files:** `src/styles/work.css`, `src/data/landing.ts` (sizes only)

- [ ] **Step 1:** `npx astro preview --port 4329 &` then `node ~/.claude/skills/c9n-landing-page/scripts/shoot.mjs --page work --overflow 360,390` and the same for `en/work`. There must be no overflow at 360 or 390.
- [ ] **Step 2:** Compare against the home page in the same viewport: same heading scale, spacing and border tone. Check Thai line breaks in the h1, descriptions and CTA. Adjust `size` values so no two neighbours look alike and the grid has no holes at 1440 under All.
- [ ] **Step 3:** Run `/impeccable` critique on `/work/`. Apply fixes that stay inside the constraints.
- [ ] **Step 4:** Build and run all checks. Commit `style(work): polish portfolio layout`.
- [ ] **Step 5:** Show the user screenshots at desktop, tablet and mobile. Open a PR only when asked (`c9n-pull-requests`).
