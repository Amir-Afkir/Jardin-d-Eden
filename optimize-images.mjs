// optimize-images.mjs
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

// ← adapte si besoin
const INPUT = "./public/baniere/baniere2.webp";
const OUT_DIR = "./public/baniere";

// Tailles cibles pour le hero
const SIZES = [2560, 1920, 1536];

// Qualités
const AVIF_Q = 55; // 45–60
const WEBP_Q = 78; // 70–80

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function buildOne(width) {
  const base = path.basename(INPUT, path.extname(INPUT));
  const avifOut = path.join(OUT_DIR, `${base}-${width}.avif`);
  const webpOut = path.join(OUT_DIR, `${base}-${width}.webp`);

  // AVIF
  await sharp(INPUT).resize({ width }).avif({ quality: AVIF_Q }).toFile(avifOut);
  // WebP
  await sharp(INPUT).resize({ width }).webp({ quality: WEBP_Q }).toFile(webpOut);

  return { avifOut, webpOut };
}

async function buildBlur() {
  const base = path.basename(INPUT, path.extname(INPUT));
  const blurOut = path.join(OUT_DIR, `${base}-blur.webp`);
  await sharp(INPUT).resize({ width: 24 }).webp({ quality: 25 }).toFile(blurOut);
  const buf = await fs.readFile(blurOut);
  const b64 = `data:image/webp;base64,${buf.toString("base64")}`;
  return { blurOut, b64 };
}

(async () => {
  await ensureDir(OUT_DIR);

  console.log("→ Génération des dérivés…");
  for (const w of SIZES) {
    const { avifOut, webpOut } = await buildOne(w);
    console.log(`  ✓ ${avifOut}`);
    console.log(`  ✓ ${webpOut}`);
  }

  const { blurOut, b64 } = await buildBlur();
  console.log(`  ✓ ${blurOut}`);

  console.log("\nCopie cette valeur dans Hero.tsx → blurDataURL :\n");
  console.log(b64);
  console.log("\nTerminé ✅");
})();