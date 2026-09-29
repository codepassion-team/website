import sharp from "sharp";
import { readdir, stat, mkdir } from "node:fs/promises";
await mkdir("public/media/logos", { recursive: true });
let sourceBytes = 0,
  outputBytes = 0;
for (const file of (await readdir("public/logos")).filter((file) =>
  file.endsWith(".png"),
)) {
  const source = `public/logos/${file}`;
  const output = `public/media/logos/${file.replace(".png", ".webp")}`;
  await sharp(source)
    .resize({
      width: 320,
      height: 180,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(output);
  sourceBytes += (await stat(source)).size;
  outputBytes += (await stat(output)).size;
}
console.log(
  JSON.stringify({
    sourceBytes,
    outputBytes,
    savedPercent: Math.round((1 - outputBytes / sourceBytes) * 100),
  }),
);
