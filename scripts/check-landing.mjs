import assert from "node:assert/strict";
import { readFile, access, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  customerLogos,
  certificates,
  courses,
  products,
  projects,
  technologyLayers,
} from "../src/data/landing.ts";

for (const [locale, path] of [
  ["th", "dist/index.html"],
  ["en", "dist/en/index.html"],
]) {
  const html = await readFile(path, "utf8");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(
    new Set(ids).size,
    ids.length,
    `${locale}: DOM ids must be unique`,
  );
  assert(html.includes(`lang="${locale}"`));
  assert(html.includes(`hreflang="${locale}"`));
  assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1);
  assert.equal([...html.matchAll(/data-chapter="[0-5]"/g)].length, 6);
  assert(html.includes('class="story-layer-summary"'));
  assert(html.includes('data-layer-label="AI AGENT"'));
  assert(html.includes('data-layer-label="WORKFLOW AUTOMATION"'));
  assert(html.includes('href="https://www.tiktok.com/@codepassion"'));
  assert(!html.match(/<footer[\s\S]*data-icon="fa-brands:line"/));
  for (const match of html.matchAll(/href="#([^"]+)"/g))
    assert(ids.includes(match[1]), `Missing anchor ${match[1]}`);
  const localAssets = [
    ...html.matchAll(/(?:src|href)="(\/(?!\/)[^"#?]+)"/g),
  ].map((match) => match[1]);
  for (const asset of localAssets) await access(`dist${asset}`);
  assert.equal(
    [...html.matchAll(/data-preview-unavailable="true"/g)].length,
    1,
  );
  assert.equal([...html.matchAll(/class="customer-logo"/g)].length, 35);
  assert.equal(
    [...html.matchAll(/data-project-url="([^"]+)"/g)][0][1],
    "https://kantanaholdings.com",
  );
  const iframe = html.match(/<iframe\b[^>]*id="portfolio-frame"[^>]*>/)?.[0];
  assert(
    iframe && !/\ssrc=/.test(iframe),
    "Iframe should defer network requests until visible",
  );
  assert(
    iframe.includes(
      'sandbox="allow-scripts allow-same-origin allow-forms allow-popups"',
    ),
  );
  assert(iframe.includes("Kantana Holdings"));
  for (const project of projects)
    assert(html.includes(`data-project-url="https://${project.domain}"`));
  for (const product of products) {
    assert(ids.includes(product.id));
    assert.equal(
      [...html.matchAll(new RegExp(`href="#${product.id}"`, "g"))].length,
      3,
      "Product should be in desktop/mobile menus and footer",
    );
  }
  const portalCard = html.match(
    /<article\b[^>]*id="line-oa-customer-portal"[\s\S]*?<\/article>/,
  )?.[0];
  assert(portalCard, `${locale}: LINE OA Customer Portal product card`);
  assert(portalCard.includes("product-featured"));
  assert(portalCard.includes('href="/line-oa/"'));
  assert(!portalCard.includes('target="_blank"'));
  assert(
    portalCard.includes(
      locale === "th"
        ? "Customer Portal บน LINE OA"
        : "LINE OA Customer Portal",
    ),
  );
  assert(html.includes('"@id":"https://codepassion.co/#organization"'));
  for (const course of courses)
    assert(
      html.includes(`https://academy.codepassion.co/courses/${course.slug}/`),
    );
  for (const technology of technologyLayers.flatMap((layer) => layer.items))
    assert(html.includes(technology));
  assert(html.includes('id="motion-toggle"'));
  assert(html.includes('id="story-next"'));
  assert(html.includes('id="story-previous"'));
  assert.equal([...html.matchAll(/data-copy-side="right"/g)].length, 2);
  assert.equal([...html.matchAll(/class="technology-icon"/g)].length, 16);
  assert.equal([...html.matchAll(/data-icon="fa-brands:line"/g)].length, 1);
  assert(html.includes('id="show-preview"'));
  assert(html.includes('id="logo-motion-toggle"'));
  assert(html.includes('class="logo-set" aria-hidden="true"'));
  assert.match(
    html,
    /class="academy-emblem"[^>]*>\s*<img[^>]*src="\/brand\/codepassion.svg"/,
  );
  assert(html.includes("ACADEMY</small>"));
  assert(html.includes(locale === "th" ? "ซอฟต์แวร์" : "Software"));
  assert(
    html.includes('href="/line-oa/"'),
    `${locale}: link to LINE OA service`,
  );
  console.log(
    `PASS ${locale}: ${localAssets.length} local references, ${ids.length} unique ids, anchors, locale, complete content and deferred Kantana preview.`,
  );
}
const lineOaHtml = await readFile("dist/line-oa/index.html", "utf8");
assert(
  lineOaHtml.includes(
    '<link rel="canonical" href="https://codepassion.co/line-oa/"',
  ),
);
assert(
  lineOaHtml.includes(
    '<meta property="og:url" content="https://codepassion.co/line-oa/"',
  ),
);
assert.match(
  lineOaHtml,
  /<title>Customer Portal บน LINE OA[^<]*CodePassion<\/title>/,
);
const sitemap = await readFile("dist/sitemap.xml", "utf8");
for (const url of [
  "https://codepassion.co/",
  "https://codepassion.co/en/",
  "https://codepassion.co/line-oa/",
])
  assert(sitemap.includes(`<loc>${url}</loc>`), `Missing sitemap entry ${url}`);
assert(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
const robots = await readFile("dist/robots.txt", "utf8");
assert(robots.includes("Sitemap: https://codepassion.co/sitemap.xml"));
console.log(
  "PASS: LINE OA has a canonical URL, homepage links, and sitemap discovery.",
);
assert.equal(projects.length, 6);
assert.equal(projects[2].domain, "trphospital.com");
assert.equal(projects[2].category, "Hospital");
assert.equal(projects[5].domain, "www.franchiseexpothailand.com");
assert.equal(courses.length, 4);
assert.equal(products.length, 5);
assert.equal(certificates.length, 2);
assert.equal(customerLogos.length, 35);
const hash = async (path) =>
  createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
assert.equal(
  await hash("src/assets/logos/CodePassion_Icon.svg"),
  await hash("public/brand/codepassion.svg"),
);
let logoBytes = 0;
for (const logo of customerLogos)
  logoBytes += (
    await stat(`public/media/logos/${logo.file.replace(".png", ".webp")}`)
  ).size;
console.log(
  `PASS: 6 projects, 4 courses, 5 products, 2 badges, 35 logos, unchanged logo master. Logo payload: ${logoBytes} bytes.`,
);
