// Orijinal PNG şəkillərini sayt üçün kiçildir: img/<kateqoriya>/<model>/<ad>.webp
// İşə salmaq: npm install && npm run build
import sharp from "sharp";
import { readdirSync, statSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname, extname, basename, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/[\\/]$/, "");
const SKIP = new Set(["img", "lib", "tools", "node_modules", ".git", ".claude"]);
const list = [];

function walk(dir) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!SKIP.has(name)) walk(p); continue; }
    if (/\.(png|jpe?g|webp)$/i.test(name) && dir !== root) list.push(p);
  }
}
walk(root);

const out = [];
for (const src of list) {
  const rel = relative(root, src).split(sep).join("/");
  const dest = join(root, "img", rel.replace(extname(rel), ".webp"));
  out.push("img/" + rel.replace(extname(rel), ".webp"));
  if (existsSync(dest) && statSync(dest).mtimeMs > statSync(src).mtimeMs) continue;
  mkdirSync(dirname(dest), { recursive: true });
  await sharp(src).resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 }).toFile(dest);
  console.log("✓", basename(dest));
}
out.sort();
writeFileSync(join(root, "images.js"),
  "window.CATALOG_IMAGES = [\n" + out.map(s => "  " + JSON.stringify(s) + ",").join("\n") + "\n];\n");
console.log(`images.js: ${out.length} şəkil`);
