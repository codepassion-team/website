import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const html = await readFile("dist/line-oa/index.html", "utf8");
const text = html
  .replace(/<script[\s\S]*?<\/script>/g, "")
  .replace(/<style[\s\S]*?<\/style>/g, "")
  .replace(/<[^>]+>/g, " ");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "DOM ids must be unique");
for (const match of html.matchAll(/href="#([^"]+)"/g))
  assert(ids.includes(match[1]), `Missing anchor ${match[1]}`);
assert(html.includes('lang="th"'));
assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1);
const h1 = html.match(/<h1\b[\s\S]*?<\/h1>/)[0].replace(/<[^>]+>/g, "");
assert(h1.includes("ให้ลูกค้าเช็กงานเองผ่าน LINE"));

// Every primary CTA adds the LINE OA as a friend, same label, tagged by position
const LINE_URL = "https://line.me/ti/p/@codepassion";
const ctas = [
  ...html.matchAll(/<a\b[^>]*data-line-cta="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g),
];
const positions = ctas.map((match) => match[1]);
for (const position of [
  "nav",
  "menu",
  "hero",
  "usecases",
  "offer",
  "contact",
  "footer",
  "mobile",
])
  assert(positions.includes(position), `Missing LINE CTA at ${position}`);
for (const [tag, position, inner] of ctas) {
  assert(tag.includes(`href="${LINE_URL}"`), `CTA must open LINE: ${tag}`);
  assert(tag.includes('rel="noopener noreferrer"'));
  if (position === "footer-contact") continue;
  const label = inner
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|\s+/g, " ")
    .trim();
  assert.equal(label, "คุยกับเรา", `CTA label drift`);
}

// No contact form: conversations start in LINE
assert(!/<form\b/.test(html), "Contact form should be removed");
assert(!html.includes("demo-form"));
assert.match(
  html,
  /<img\b[^>]*src="\/qr\/line-codepassion\.svg"[^>]*alt="QR Code เพิ่มเพื่อน LINE @codepassion"/,
);
await access("dist/qr/line-codepassion.svg");

// LINE CI: page opens light by default, palette scoped to the page
assert(html.includes('data-theme="light"'));
const css = (
  await Promise.all(
    [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) =>
      readFile(`dist${match[1]}`, "utf8"),
    ),
  )
).join("\n");
assert.match(css, /--loa-green:\s*#06c755/);

// Mobile menu is a labelled disclosure that starts closed
assert.match(
  html,
  /<button\b[^>]*id="loa-menu-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="loa-mobile-menu"/,
);
assert.match(html, /<div\b[^>]*id="loa-mobile-menu"[^>]*\bhidden\b/);
for (const link of ["#use-cases", "#offer", "#faq"])
  assert.match(
    html.match(/id="loa-mobile-menu"[\s\S]*?<\/div>/)[0],
    new RegExp(`href="${link}"`),
  );

// Sticky mobile CTA starts hidden until the hero CTA scrolls away
assert.match(
  html,
  /<a\b[^>]*class="loa-mobile-cta is-hidden"[^>]*aria-hidden="true"/,
);

// FAQ is native disclosure (keyboard accessible)
assert.equal([...html.matchAll(/<details\b/g)].length, 6);
assert.equal([...html.matchAll(/<summary\b/g)].length, 6);

// Internal spec notes and unverified claims never reach the page
for (const forbidden of [
  "Grand Slam",
  "ข้อเสนอร่าง",
  "ปุ่มหลัก",
  "ข้อความใต้ปุ่ม",
  "ภาพประกอบ",
  "หมายเหตุประกอบการออกแบบ",
  "ห้ามนำ",
  "[ใส่ลิงก์",
  "ผู้รับผิดชอบต้องยืนยัน",
  "พื้นที่กรณีศึกษา",
  "สถานะก่อนเผยแพร่",
  "เรียลไทม์",
  "realtime",
  "LINE Partner",
])
  assert(!text.includes(forbidden), `Forbidden copy on page: ${forbidden}`);

// SEO: Thai-first title, one product name, page-specific share image, Service schema
assert.match(
  html,
  /<title>Customer Portal บน LINE OA[^<]*\| CodePassion<\/title>/,
);
const description = html.match(/<meta name="description" content="([^"]+)"/)[1];
assert(
  description.length <= 160,
  `Meta description ${description.length} chars`,
);
assert(html.includes('content="https://codepassion.co/og/line-oa.png"'));
await access("dist/og/line-oa.png");
const jsonLd = [
  ...html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  ),
].map((match) => JSON.parse(match[1]));
const service = jsonLd.find((data) => data["@type"] === "Service");
assert(service, "Service JSON-LD");
assert.equal(service.name, "Customer Portal บน LINE OA");
assert.equal(service.url, "https://codepassion.co/line-oa/");
assert.equal(service.provider["@id"], "https://codepassion.co/#organization");
assert(!/Code Passion(?! Co\.)/.test(text), "Use the CodePassion brand name");

// Fluid navbar: no fixed max-width container
const nav = html.match(/<nav\b[^>]*aria-label="เมนูหลัก"[^>]*>/)[0];
assert(!nav.includes("max-w-"), "Navbar should be full-width");
assert(nav.includes("loa-gutter"));

// Footer: brand, page links, contact, social, legal line
const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)[0];
for (const link of ["#use-cases", "#offer", "#faq", "#contact", "#main", "/"])
  assert(footer.includes(`href="${link}"`), `Footer link ${link}`);
assert(footer.includes('href="tel:+66886384566"'));
assert(footer.includes('href="https://line.me/ti/p/@codepassion"'));
for (const social of ["youtube", "facebook", "tiktok"])
  assert(footer.includes(social), `Footer social ${social}`);
assert(footer.includes("Code Passion Co., Ltd."));

// Navbar wordmark (Prompt bold) replaces the CodePassion logo
const navLogo = html.match(/<a\b[^>]*class="loa-logo[^"]*"[\s\S]*?<\/a>/)[0];
assert(navLogo.includes("LINE OA") && navLogo.includes("สำหรับธุรกิจคุณ"));
const header = html.match(/<header\b[\s\S]*?<\/header>/)[0];
assert(
  !header.includes("CodePassion_Icon"),
  "Navbar should not show CodePassion logo",
);

// Stock photos: optimized, described, credited
const photos = [
  ...html.matchAll(/<img\b[^>]*src="\/_astro\/[^"]+\.webp"[^>]*>/g),
].map((match) => match[0]);
assert(photos.length >= 4, `Expected 4 photos, got ${photos.length}`);
for (const photo of photos) assert.match(photo, /alt="[^"]+"/);
assert(footer.includes("Unsplash"), "Photo credit in footer");

// Mock screen is labelled as an example
assert(text.includes("ตัวอย่างหน้าจอ ปรับตามขอบเขตโครงการ"));

console.log(
  `PASS: LINE OA Customer Portal page — ${ctas.length} LINE CTAs, no form, 6 FAQ, ${ids.length} unique ids.`,
);
