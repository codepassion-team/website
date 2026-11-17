import type { APIRoute } from "astro";

// Every public page, found at build time. Paths starting with "_" are disabled
// pages and 404 is not a page Google should index.
const pages = Object.keys(
  import.meta.glob(["./**/*.astro", "!./**/_*", "!./**/_*/**", "!./404.astro"]),
)
  .map((file) =>
    file
      .replace(/^\.\//, "")
      .replace(/\.astro$/, "")
      .replace(/(^|\/)index$/, ""),
  )
  .map((path) => (path ? `${path}/` : ""))
  .sort();

export const GET: APIRoute = ({ site }) => {
  const urls = pages
    .map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`)
    .join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
