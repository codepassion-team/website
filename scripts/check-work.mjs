import assert from "node:assert/strict";
import { projects, projectGroups } from "../src/data/landing.ts";

assert.equal(projects.length, 19);
assert.equal(new Set(projects.map((p) => p.slug)).size, 19);
assert.deepEqual(
  projects.filter((p) => p.featured).map((p) => p.domain),
  [
    "kantanaholdings.com",
    "ddgjewelry.com",
    "trphospital.com",
    "naturalhome.co.th",
    "smartsmeexpo.com",
    "www.franchiseexpothailand.com",
  ],
);
// Image-only projects: shown as a screenshot, never linked or embedded.
const imageOnly = ["nnm", "apo-crm", "smiley", "twhe", "aestec", "muztea"];
assert.deepEqual(
  projects.filter((p) => p.imageOnly).map((p) => p.slug),
  imageOnly,
);
assert.equal(projects.find((p) => p.slug === "nnm").kind, "internal");
assert.deepEqual(
  projects.filter((p) => p.kind === "product").map((p) => p.slug),
  ["memberconnex", "academy"],
);
const groups = new Set(projectGroups.map((g) => g.id));
for (const p of projects) {
  assert(groups.has(p.group), `${p.slug} group`);
  assert(p.description && p.tags.length >= 1, `${p.slug} copy`);
}

import { access, readdir } from "node:fs/promises";
const workProjects = projects.filter((p) => !p.hideOnWorkPage);
assert.deepEqual(
  projects.filter((p) => p.hideOnWorkPage).map((p) => p.slug),
  ["smartsme"],
);
// Every card is the same size (user request).
assert(
  projects.every((p) => !("size" in p)),
  "no per-card sizes",
);
// Image-only projects carry a gallery of 6–7 images, picked in the dialog.
const gallery = {};
for (const slug of imageOnly) {
  gallery[slug] = (await readdir(`src/assets/work/gallery/${slug}`)).filter(
    (f) => f.endsWith(".webp"),
  ).length;
  assert(
    gallery[slug] >= 6 && gallery[slug] <= 7,
    `${slug} gallery has ${gallery[slug]} images`,
  );
}
for (const p of workProjects) await access(`src/assets/work/${p.slug}.webp`);

import { readFile } from "node:fs/promises";
const thai = {
  "movie-school": "เว็บไซต์งานพร้อมระบบจองที่นั่งฟรี",
  nnm: "ระบบจัดการตลาดหนองเหนียว",
};
for (const [locale, path, root] of [
  ["th", "dist/portfolios/index.html", "/"],
  ["en", "dist/en/portfolios/index.html", "/en/"],
]) {
  const html = await readFile(path, "utf8");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${locale}: unique ids`);
  for (const m of html.matchAll(/href="#([^"]+)"/g))
    assert(ids.includes(m[1]), `${locale}: missing anchor ${m[1]}`);
  for (const m of html.matchAll(/(?:src|href)="(\/(?!\/)[^"#?]+)"/g))
    await access(`dist${m[1]}`);
  assert(html.includes(`lang="${locale}"`));
  assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1);
  assert(
    html.includes(
      `rel="canonical" href="https://codepassion.co${root}portfolios/"`,
    ),
  );
  assert(
    html.includes('hreflang="th" href="https://codepassion.co/portfolios/"'),
  );
  assert(
    html.includes('hreflang="en" href="https://codepassion.co/en/portfolios/"'),
  );
  const cards = [...html.matchAll(/<button[^>]*class="work-card[ "][^>]*>/g)];
  assert.equal(cards.length, workProjects.length, `${locale}: card count`);
  assert(!html.includes('data-slug="smartsme"'));
  assert(!html.includes("work-card--"), `${locale}: uniform cards`);
  assert.deepEqual(
    [...html.matchAll(/data-card="label">\s*(\d\d) \//g)].map((m) => m[1]),
    workProjects.map((_, i) => String(i + 1).padStart(2, "0")),
    `${locale}: cards numbered in order`,
  );
  assert.equal(
    [...html.matchAll(/data-group="/g)].length,
    workProjects.length + 1 + projectGroups.length,
  );
  assert.equal([...html.matchAll(/<iframe/g)].length, 1, "dialog iframe only");
  assert(!/<iframe[^>]*\ssrc=/.test(html), "iframe loads lazily");
  for (const slug of imageOnly) {
    const card = cards.find((m) => m[0].includes(`data-slug="${slug}"`))[0];
    assert(!card.includes("data-project-url"), `${slug} has no live link`);
    const { domain } = projects.find((p) => p.slug === slug);
    if (domain)
      assert(!html.includes(`https://${domain}`), `${slug} not linked`);
  }
  if (locale === "th")
    for (const text of Object.values(thai)) assert(html.includes(text));
  else
    for (const p of workProjects)
      assert(
        html.includes(p.description.replaceAll("&", "&amp;")),
        `en ${p.slug} description`,
      );
  assert(html.includes(`href="${root}#contact"`), "header CTA goes home");
  assert(
    html.includes(`href="${root === "/" ? "/en/" : "/"}portfolios/"`),
    "lang switch",
  );
  assert(html.includes('"@type":"ItemList"'));
  assert(html.includes('class="work-gallery-thumbs"'), "dialog has thumbnails");
  for (const slug of imageOnly) {
    const tpl = html.match(
      new RegExp(
        `<template data-gallery-for="${slug}"[^>]*>([\\s\\S]*?)</template>`,
      ),
    )?.[1];
    assert(tpl, `${locale}: ${slug} gallery template`);
    assert.equal(
      [...tpl.matchAll(/<img /g)].length,
      gallery[slug],
      `${slug} gallery images`,
    );
  }
  assert(!html.includes("menu-motion-toggle"));
  assert(html.includes("<noscript"));
}
for (const old of ["dist/work/index.html", "dist/portfolio/index.html"])
  await assert.rejects(access(old), `no ${old}`);
const sitemap = await readFile("dist/sitemap.xml", "utf8");
assert(
  sitemap.includes("/portfolios/</loc>") &&
    sitemap.includes("/en/portfolios/</loc>"),
);
for (const [path, href] of [
  ["dist/index.html", "/portfolios/"],
  ["dist/en/index.html", "/en/portfolios/"],
]) {
  const portfolio = (await readFile(path, "utf8")).match(
    /id="work"[\s\S]*?<\/section>/,
  )[0];
  assert(portfolio.includes(`href="${href}"`), "home has a View all work link");
}
console.log(`PASS: ${workProjects.length} work cards, TH + EN`);
