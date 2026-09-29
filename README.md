# CodePassion website

The CodePassion company website is an Astro landing page for software development, solution architecture, system design, and integration. Thai is the default at `/`; English is available at `/en/`.

## What the site includes

- A scroll-driven architecture story. The opening keeps the message on the left and the stack on the right; scrolling centers the stack, then expands and highlights AI Agent, Application, Workflow Automation, Data Transformation, and Infrastructure in order. Previous/Next controls, a skip link, and a motion toggle support different ways to explore it.
- A mobile layout with a fixed brand navigation bar, an accessible menu, a portrait composition of the architecture graphic, and shorter story timing.
- Services, four products (Sekweb, MemberConnex, Workery, and WorkEngine 0.3), CodePassion Academy courses, technology stacks, certifications, customer and partner logos, and contact channels.
- Six portfolio sites, with Kantana Holdings first. The selected site's iframe starts loading when its preview enters view; a branded cover masks the initial blank frame. Direct links remain available if a third-party site blocks embedding.
- Thai and English copy with Noto Sans Thai, the original CodePassion vector logo, and an editable [style tile](public/design/style-tile.html).

The animation is currently an original responsive canvas illustration. There are **no generated video clips or image sequences**: Higgsfield image/video tools were unavailable during production. The story and future footage requirements are documented in [the production note](docs/design/cinematic-production.md).

## Run locally

```sh
npm install
npm run dev
```

Astro serves the site at `http://localhost:4321/` by default. Visit `/en/` for English and `/design/style-tile.html` for the design board.

## Validate

```sh
npm run build
node scripts/check-landing.mjs
node scripts/check-story.mjs
```

The content check examines the built Thai and English pages, local asset references, navigation targets, products, courses, portfolio entries, and logo assets. The story check verifies chapter holds, smooth forward and reverse progress, layer order, and connector geometry. Browser review is still needed for visual composition, accessibility interactions, and third-party iframe behavior. A local build does not publish the site.

## Edit the site

| What to change | Location |
| --- | --- |
| Business details, services, products, courses, projects, customers, technologies, and links | `src/data/landing.ts` |
| Thai business copy | `src/data/landing-locales.ts` |
| Thai interface labels | `src/data/landing-ui.ts` |
| Page sections and navigation | `src/components/landing/` |
| Responsive layout and typography | `src/styles/landing.css` |
| Story scroll timing | `src/scripts/story-timeline.ts` |
| Architecture drawing and arrow connectors | `src/scripts/architecture.ts`, `src/scripts/story-connector.ts` |
| Customer logo masters and optimized site assets | `public/logos/`, `public/media/logos/` |
| Brand and certification assets | `public/brand/`, `public/certifications/` |

See [the handoff](docs/design/HANDOFF.md) for detailed production notes and known limitations. Issue-tracker, triage-label, and domain-documentation conventions are in `docs/agents/`; the root `CLAUDE.md` points engineering skills to them.
