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

// Every primary CTA uses the same label, targets the one form, and is tagged
const ctas = [
  ...html.matchAll(/<a\b[^>]*data-demo-cta="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g),
];
const positions = ctas.map((match) => match[1]);
for (const position of ["nav", "hero", "usecases", "offer", "footer", "mobile"])
  assert(positions.includes(position), `Missing primary CTA at ${position}`);
for (const [tag, , inner] of ctas) {
  assert(tag.includes('href="#demo-form"'), `CTA must target form: ${tag}`);
  const label = inner.replace(/<[^>]+>/g, "").trim();
  assert.equal(label, "นัดดู Demo สำหรับธุรกิจของคุณ", `CTA label drift`);
}
assert.equal([...html.matchAll(/<form\b/g)].length, 1);
assert.match(html, /<form\b[^>]*id="demo-form"/);

// Form fields from the spec
for (const name of ["name", "company", "channel", "contact", "topic"])
  assert.match(html, new RegExp(`name="${name}"`), `Missing field ${name}`);
assert(text.includes("ขอนัดดู Demo"));
assert.match(html, /<[^>]+id="demo-success"[^>]*\bhidden\b/);
assert(text.includes("ได้รับคำขอแล้วครับ"));

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

// Mock screen is labelled as an example
assert(text.includes("ตัวอย่างหน้าจอ ปรับตามขอบเขตโครงการ"));

console.log(
  `PASS: LINE OA Customer Portal page — ${ctas.length} primary CTAs, 1 form, 6 FAQ, ${ids.length} unique ids.`,
);
