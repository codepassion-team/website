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

Single-page site. `src/pages/index.astro` composes section components.

### Component conventions

- **Astro `.astro`** — pages and static sections (`src/components/home/`, `src/components/layout/`)
- **React `.tsx`** — interactive UI via shadcn/ui pattern (`src/components/ui/`)
- **Styling** — Tailwind utility classes + CSS custom properties for theming
- **Theme** — light/dark via `data-theme` attribute on `<html>`

### Directory structure

```
src/
  pages/
    index.astro              # Active single-page site
    _blog_disabled/          # Disabled blog (components, layouts, styles)
    _*_disabled.astro        # Other disabled pages
  components/
    home/                    # Page sections (Hero, Services, Team, etc.)
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
