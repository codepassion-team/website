# CodePassion landing page

The new Astro homepage is a Thai-first, bilingual landing page for CodePassion. The opening places the business message on the left and an original architecture stack on the right. Scrolling centers the stack and introduces five layers: AI Agent, Application, Workflow Automation, Data Transformation, and Infrastructure. The selected layer expands within the stack; its label connects to it by an arrow. Previous/Next controls move between reading positions. Mobile uses a portrait composition and fixed navigation.

## Preview and editing

- Thai: http://127.0.0.1:4321/
- English: http://127.0.0.1:4321/en/
- Style tile: http://127.0.0.1:4321/design/style-tile.html
- Business copy, products, courses, technologies, projects, customers, and channels: `src/data/landing.ts`
- Thai copy: `src/data/landing-locales.ts`; interface translations: `src/data/landing-ui.ts`
- Composition and responsive layout: `src/styles/landing.css`
- Scroll timing and navigation: `src/scripts/story-timeline.ts`, `src/scripts/landing.ts`
- Stack and connector graphics: `src/scripts/architecture.ts`, `src/scripts/story-connector.ts`

Run `npm run dev -- --host 127.0.0.1`. Build with `npm run build`, then run `node scripts/check-landing.mjs` and `node scripts/check-story.mjs`. The pnpm lockfile also passes `pnpm install --frozen-lockfile --lockfile-only --offline --ignore-scripts`.

## Business content

The page covers solution architecture, software development, integration, products Sekweb, MemberConnex, Workery and WorkEngine 0.3, CodePassion Academy courses, certificates, customers and partners, technology stacks, and six selectable portfolio websites. Kantana is first and loads only when its preview is visible; a branded cover masks the initial blank iframe while it loads. YouTube, LINE OA, Facebook and the confirmed TikTok profile are linked. The LINE contact button has the LINE icon; the footer link uses text.

Course details came from `../academy`; technology names and icon URLs were checked against https://codepassion.co/. MemberConnex, Workery and WorkEngine lack confirmed public product URLs, so their card actions lead to contact. The supplied certification graphics are shown without added accreditation claims. All 35 supplied customer marks are retained in `public/logos/`, with smaller WebP derivatives in `public/media/logos/` for the site. The original CodePassion vector is copied unchanged to `public/brand/codepassion.svg` and the style tile. Font files and licenses are in `public/design/assets/`.

## Motion and fallback

Desktop story travel is 640svh plus a 100svh pinned stage; mobile is 440svh plus its stage. The browser's normal scrolling works in both directions. The opening stack moves from x=75.5% to x=50% before the first layer's copy appears, then remains centered on desktop. Copy alternates sides. Layer order never changes: emphasis enlarges the selected slab by up to 18%, adds space around it, and dims the others. Callout arrows track measured HTML labels and projected slab edges. Short mobile screens fit the entire assembly above the copy.

Reduced motion, the motion toggle, save-data and unavailable canvas use a static composition with all five layer explanations in normal page flow. The menu remains fixed on phones. The mobile and desktop compositions are responsive variants of the same site; there are no fetched frame sequences.

## Production status and verification

No Higgsfield generation or job tools were callable, so no generated stills, portrait or landscape clips, video seam frames or image sequences are included. The live motion is original native canvas drawing. `cinematic-production.md` records the story and asset dependency without claiming generated footage.

The production build and both content checks pass. Browser inspection covered desktop and phone opening layouts, chapter navigation, reverse scrolling, reduced-motion path, fixed mobile menu, the logo row, Kantana loading cover, and 820px/900px connector routing. Asset checks verify local paths, 35 logo marks, six portfolio projects, four products and courses, and the unchanged vector logo. The 35 WebP logo derivatives total 224,482 bytes. Embedded third-party websites control their own load behavior; direct links remain available. Browser compilation and local checks do not measure real-device loading speed or guarantee external iframe readiness.

This PR provides the code for deployment review. No public deployment is performed by the local build.
