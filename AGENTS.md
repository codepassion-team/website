# CodePassion Website

Corporate website for Code Passion Co., Ltd. (codepassion.co).

## Tech Stack

- **Framework**: Astro 4.6 (static site generation)
- **UI Library**: React 18 (interactive components via shadcn/ui)
- **Styling**: Tailwind CSS 3 + CSS custom properties (`src/styles/theme.css`)
- **Components**: shadcn/ui (badge, button, card, separator in `src/components/ui/`)
- **Icons**: astro-icon with `@iconify-json/fa-brands` and `@iconify-json/mdi`
- **Fonts**: Noto Sans Thai Variable, Mitr, JetBrains Mono (via `@fontsource`)

## Commands

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run format` — format with Prettier

## Architecture

`src/pages/index.astro` (Thai) and `src/pages/en/index.astro` compose the home sections.
Stand-alone landing pages such as `line-oa.astro` are built from `src/components/landing/`
(see the `c9n-landing-page` Skill). `sitemap.xml.ts` and `404.astro` sit beside them.
Pages prefixed `_..._disabled` are not built.

### Component conventions

- **Astro `.astro`** — pages and static sections (`src/components/home/`, `src/components/layout/`)
- **React `.tsx`** — interactive UI via shadcn/ui pattern (`src/components/ui/`)
- **Styling** — Tailwind utility classes + CSS custom properties for theming
- **Theme** — light/dark via `data-theme` attribute on `<html>`

### Directory structure

```
src/
  pages/
    index.astro              # Home (Thai); en/index.astro is English
    line-oa.astro            # Landing page
    sitemap.xml.ts, 404.astro
    _blog_disabled/          # Disabled blog (components, layouts, styles)
    _*_disabled.astro        # Other disabled pages
  components/
    home/                    # Page sections (Hero, Services, Team, etc.)
    landing/                 # Landing page sections
    layout/                  # Navbar, Footer
    ui/                      # shadcn/ui React components
  styles/
    index.css                # Entry (imports global.css + theme.css)
    global.css               # Utilities and base styles
    theme.css                # CSS custom properties for theming
  assets/
    logos/                   # Client/partner logos
    team/                    # Team member photos
  lib/utils.ts               # cn() for Tailwind class merging
  types.ts                   # TypeScript type definitions
public/
  certifications/            # Certification badge SVGs
  favicon.svg, cover.jpg
```

## Agent skills

### Issue tracker

Issues and specs are tracked in GitHub Issues for `codepassion-team/website`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

Use a single-context layout rooted at `CONTEXT.md` and `docs/adr/` (create them when first needed). See `docs/agents/domain.md`.

## Conventions

Branch, commit and PR per the `c9n-git-branching`, `c9n-commit-messages` and `c9n-pull-requests` Skills.
`CLAUDE.md` only imports this file. Keep this file under 200 lines.
