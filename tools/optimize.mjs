// products/<model>/<ad>.png  ->  images/<model>/<ad>.webp  (+ images.js siyahısı)
// İşə salmaq: npm install && npm run build
import sharp from "sharp";
import { readdirSync, statSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(root, "products"), OUT = join(root, "images");
const list = [];
// 1, 2, … 10 (rəqəmlərə görə), mətn kimi 1, 10, 2 yox
const byName = (a, b) => a.localeCompare(b, "en", { numeric: true });

for (const model of readdirSync(SRC).sort(byName)) {
  if (!statSync(join(SRC, model)).isDirectory()) continue;
  for (const file of readdirSync(join(SRC, model)).sort(byName)) {
    if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
    const name = file.slice(0, -extname(file).length) + ".webp";
    const src = join(SRC, model, file), dest = join(OUT, model, name);
    list.push(`images/${model}/${name}`);
    if (existsSync(dest) && statSync(dest).mtimeMs > statSync(src).mtimeMs) continue;
    mkdirSync(dirname(dest), { recursive: true });
    await sharp(src).resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 }).toFile(dest);
    console.log("✓", model + "/" + name);
  }
}
writeFileSync(join(root, "images.js"),
  "window.CATALOG_IMAGES = [\n" + list.map(s => "  " + JSON.stringify(s) + ",").join("\n") + "\n];\n");
console.log(`images.js: ${list.length} şəkil`);
