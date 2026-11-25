import assert from "node:assert/strict";
import { projects, projectGroups } from "../src/data/landing.ts";

assert.equal(projects.length, 13);
assert.equal(new Set(projects.map((p) => p.slug)).size, 13);
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
assert(!projects.some((p) => p.domain.includes("aestec")));
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

import { access } from "node:fs/promises";
const workProjects = projects.filter((p) => !p.hideOnWorkPage);
assert.deepEqual(
  projects.filter((p) => p.hideOnWorkPage).map((p) => p.slug),
  ["smartsme"],
);
for (const p of workProjects) await access(`src/assets/work/${p.slug}.webp`);
