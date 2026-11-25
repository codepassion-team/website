# Portfolio page ("ผลงานของเรา" / "Our Work") — design

Date: 2026-11-25

## Intent

Give anyone a single place to browse the websites and systems CodePassion has
built. It is a browsing page, not a sales case-study page: quick to scan,
filterable, one click to see the real site. It extends the existing site
(same header, footer, dark theme, fonts, CSS), it is not a redesign.

## Goals

- New pages `/work/` (Thai) and `/en/work/` (English).
- Hero, filterable project grid (13 projects) with varied card sizes, lightweight detail
  panel, closing CTA.
- A "ดูผลงานทั้งหมด →" / "View all work →" link at the bottom-left of the home
  page's "02 / SELECTED WORK" section, under the project list
  (`src/components/landing/Portfolio.astro`).
- One project list shared by the home section and the new page.

## Non-goals

- Per-project sub-pages (`/work/<slug>/`).
- "Business challenge / Our solution / Results" write-ups. We have no source
  for them; the brief forbids inventing details.
- A CMS. Projects stay as data in `src/data/landing.ts`.
- Changing the header's look, the palette or the fonts.

## Anti-goals (a failure even if it works)

- Any invented client name, result, metric, testimonial or feature.
- Cards that all look the same; a generic SaaS card grid.
- Heavy page: no iframes in the grid, no new JS libraries, no React island.
- Neon, glassmorphism, parallax, attention-grabbing motion.

## Constraints

- Astro 4.6, existing landing CSS (`src/styles/landing.css`,
  `landing-theme.css`, `/design/tokens.css`). Use existing tokens and classes
  (`section`, `section-top`, `eyebrow`, `micro`, `section-heading`, `button`,
  `button-light`, `button-quiet`, browser-chrome styles from the home
  preview). Red brand color only as a small accent (e.g. active filter
  underline, hover border).
- Thai and English copy through the existing `translate()` /
  `getLandingContent(locale)` pattern (`src/data/landing-ui.ts`,
  `src/data/landing-locales.ts`).
- Motion (my call): honour `prefers-reduced-motion` only. The header's
  "Motion on" toggle controls just the home 3D canvas, so `Header.astro`
  hides it on `/work/` (via prop). No cross-page motion setting.
- Sitemap picks up the new pages automatically (`src/pages/sitemap.xml.ts`).

## Approaches considered

1. **Static Astro page + small vanilla script (chosen).** Same stack as the
   home page. Filter via buttons and `data-category`; detail via native
   `<dialog>`; live preview reuses the home page's iframe loader.
2. Per-project sub-pages — rejected: each project has only name, category,
   domain and one line, so the pages would be near-empty.
3. React island with shadcn/ui — rejected: the landing is plain Astro + vanilla
   TS (`src/scripts/landing.ts`); React adds hydration cost for no gain.

Card thumbnails: user picked **real screenshots captured once and committed**
(over live iframes per card, or logo-on-dark covers).

## Projects (13)

Aestec Clinic Discovery was considered and excluded by the user.

Order = display order. `kind`: `client` (client work), `product` (our own
product, shown with a "ผลิตภัณฑ์ของ CodePassion" label), `internal`
(login-only system: image only, no live preview, no visit link).

| # | Name | URL | Filter group | Card label (TH / EN) | Kind |
|---|---|---|---|---|---|
| 1 | Kantana Holdings | kantanaholdings.com | Corporate | องค์กร / Corporate | client |
| 2 | DDG Jewelry | ddgjewelry.com | E-commerce | เครื่องประดับ / Jewelry | client |
| 3 | Teeraporn Hospital | trphospital.com | Healthcare | โรงพยาบาล / Hospital | client |
| 4 | Natural Home | naturalhome.co.th | Corporate | อสังหาริมทรัพย์ / Property | client |
| 5 | Smart SME Expo | smartsmeexpo.com | Events | งานแสดงสินค้า / Exhibition | client |
| 6 | Franchise Expo Thailand | www.franchiseexpothailand.com | Events | งานแสดงสินค้า / Exhibition | client |
| 7 | คาบนี้ที่โรงหนัง | movie-school.c9n.co | Events | งานอีเวนต์ / Event | client |
| 8 | MindSciX 2026 | mindsciencex2026.c9n.co | Events | งานอีเวนต์ / Event | client |
| 9 | KCP | www.kcpmaster.com | Corporate | องค์กร / Corporate | client |
| 10 | LawNextStep E-Filing | efiling.lawnextstep.com | Platforms & systems | ระบบยื่นเอกสารออนไลน์ / E-filing system | client |
| 11 | Nong Niaw Market Dashboard | nnm.codepassion.co | Platforms & systems | ระบบจัดการตลาด / Market management | internal |
| 12 | MemberConnex | connex.codepassion.co | Platforms & systems | ระบบสมาชิกผ่าน LINE OA / Membership platform | product |
| 13 | CodePassion Academy | academy.codepassion.co | Platforms & systems | แพลตฟอร์มคอร์สเรียน / Learning platform | product |

Filter groups (TH / EN): ทั้งหมด / All · องค์กร / Corporate ·
อีคอมเมิร์ซ / E-commerce · สุขภาพ / Healthcare · งานอีเวนต์ / Events ·
แพลตฟอร์มและระบบ / Platforms & systems.

**Descriptions:** one factual line per project (TH + EN), stating only what
the site visibly is (e.g. MindSciX: "เว็บลงทะเบียนงาน MindSciX 2026 Thailand
Research & Innovation Forum" ; movie-school: "เว็บไซต์งานพร้อมระบบจองที่นั่งฟรี";
NNM: "ระบบจัดการตลาดหนองเหนียว"). No claims about outcomes. The team reviews
this copy in the PR.

**Tags (my call):** every card gets 1–2 service tags describing what the
site visibly is (e.g. "เว็บไซต์องค์กร", "ระบบลงทะเบียน", "ระบบจองที่นั่ง",
"แดชบอร์ด"). Tech tags are added only where the builder can confirm the stack
from the project's repo in `codepassion-team` (`gh api repos/codepassion-team/<repo>/languages`
or its `package.json`), e.g. movie-school: Astro, Cloudflare Workers, Google
Apps Script; MemberConnex: LINE OA, LIFF. Never guess a stack.

**Event dates:** movie-school (26 Nov 2026) and MindSciX (28 Nov 2026) stay
online after their events (user confirmed), so they keep live preview and
visit links. Their copy states the event date neutrally ("งานวันที่ 26 พ.ย.
2569"), never "register now".

## Page structure (`/work/`)

1. **Header** — existing `Header.astro`. Changes allowed (behaviour, not
   look): hash links become home-relative (`/#contact`, `/en/#contact` …),
   brand links to `/` or `/en/`, the TH/EN switch links to the matching
   page (`/work/` ↔ `/en/work/`) via a new optional prop. Add "ผลงาน / Work"
   nav item? **No** — nav is unchanged; the page is reached from the home
   section link and the footer's existing "Our work" link (re-pointed to
   `/work/`).
2. **Hero** — `section-top` row: eyebrow `OUR WORK` + micro text with the
   project count. `h2`-scale heading "ผลงานของเรา" / "Our Work", secondary
   line "Digital Experiences Built with Purpose." (EN) / Thai equivalent, one
   short paragraph. Same type scale and spacing as home section headings; no
   decorative art.
3. **Filter** — a row of text buttons (`aria-pressed`), muted gray, active
   one white with a thin red underline. Horizontal scroll on mobile.
   Filtering fades cards out/in (opacity + short transform, ~200ms), hidden
   cards get `hidden`. A live region announces the count.
4. **Grid** — 12-column CSS grid, `grid-auto-flow: dense`. Each project has a
   `size` in data (`lg` = 8 cols, `md` = 6, `sm` = 4) chosen to give a
   rhythm of big/small; tablet 2 columns (`lg` spans both), mobile 1 column.
   Card: screenshot in a thin browser frame (reuse home browser-chrome look)
   → number + label (micro) → name → one-line description → tags →
   "ดูผลงาน →" affordance. Whole card is one `<button>` opening the detail.
   Hover: border lightens, image scales ~1.03, arrow nudges. Product and
   internal cards carry their small label.
5. **Detail** — native `<dialog>` (side sheet on desktop, full screen on
   mobile), opened from the card, closable with Esc/close button/backdrop,
   focus returns to the card. Content: label, name, description, tags,
   preview, actions.
   - client/product: screenshot first, with a "โหลดตัวอย่างสด / Load live
     preview" button reusing the home iframe loader (sandbox attrs,
     `unavailablePreviews` fallback), plus "ไปที่เว็บไซต์ ↗" link.
   - internal (NNM): screenshot only, no live preview, no external link,
     note "ระบบภายใน · ต้องล็อกอิน".
   - URL hash `#<slug>` opens that project on load (shareable), cleared on
     close.
6. **Closing CTA** — mirrors the home contact section's style at a smaller
   scale: "มีโปรเจกต์ในใจไหม? / Have a project in mind?", "Let's build
   something meaningful together.", `button button-light` to
   `company.contactUrl` (LINE) labelled "ติดต่อเรา / Contact Us", plus the
   phone link.
7. **Footer** — the home footer, extracted from `LandingPage.astro` into a
   shared component so both pages use it; its hash links become
   home-relative.

`<noscript>`: all cards visible, filter hidden, cards link straight to the
site (internal: no link).

## Screenshots

- Captured once with a headless browser at 1440×900, top of page, cookie
  banners dismissed if any, saved as WebP under `src/assets/work/<slug>.webp`
  and rendered via `astro:assets` `<Image>` (responsive widths, lazy except
  the first two).
- NNM: one screenshot of its public login page (user: "one image is enough").
- The user reviews the 13 images before they are committed.

## Home page change

`Portfolio.astro`: below `.project-list`, add `<a class="button button-quiet"
href="/work/">ดูผลงานทั้งหมด →</a>` (`/en/work/` for EN). The home list keeps
showing the current 6 projects (first 6 of the shared list, or a `featured`
flag — builder's choice).

## SEO

Own `<title>`, description, canonical, hreflang TH/EN/x-default, OG using
`/cover.jpg`. `ItemList` JSON-LD of `CreativeWork` items (name, url) for
client/product projects.

## Left to the builder

- Exact `size` assignment per project and visual rhythm.
- Whether the page shares a layout component with `LandingPage.astro` or
  copies the `<head>`; how the iframe loader is shared with
  `src/scripts/landing.ts`.
- Exact Thai wording of the secondary headline and descriptions (factual,
  reviewed in PR).
- Screenshot script location (scratch, not committed, is fine).

## Calls I made (user to check)

- URL `/work/`; nav bar unchanged, entry via home link + footer link.
- MemberConnex and Academy shown as "our product", not client work.
- NNM shown with its login-page screenshot, no link.
- Filter groups above (Property folded into Corporate).
- CTA goes to LINE (same as home contact).
